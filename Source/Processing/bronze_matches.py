from pathlib import Path
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, current_timestamp
from delta import configure_spark_with_delta_pip

# folders, built from this file's location so it works from any terminal
BASE = Path(__file__).resolve().parents[1] / "Data"
BRONZE_PATH = str(BASE / "bronze" / "matches")
CHECKPOINT_PATH = str(BASE / "checkpoints" / "bronze_matches")

builder = (
    SparkSession.builder
    .appName("bronze_matches")
    .master("local[*]")
    .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
    .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog")
)
spark = configure_spark_with_delta_pip(
    builder,
    extra_packages=["org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.3"],
).getOrCreate()

# 1. READ — readStream instead of read, so Spark can track offsets
raw = (
    spark.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", "localhost:9092")
    .option("subscribe", "raw.matches")
    .option("startingOffsets", "earliest")
    .load()
)

# 2. SHAPE — your select from read_kafka.py
bronze = raw.select(
    col("key").cast("string").alias("key"),
    col("value").cast("string").alias("value"),
    col("topic"),
    col("partition"),
    col("offset"),
    col("timestamp"),
    current_timestamp().alias("_ingested_at"),
)

# 3. WRITE — append to Delta, remember position in the checkpoint, run once and stop
query = (
    bronze.writeStream
    .format("delta")
    .outputMode("append")
    .option("checkpointLocation", CHECKPOINT_PATH)
    .trigger(availableNow=True)
    .start(BRONZE_PATH)
)
query.awaitTermination()

# 4. VERIFY — read the Delta table back as a normal batch
print("Rows in Bronze:", spark.read.format("delta").load(BRONZE_PATH).count())
spark.stop()