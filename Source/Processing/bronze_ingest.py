from pathlib import Path
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, current_timestamp
from delta import configure_spark_with_delta_pip

BASE = Path(__file__).resolve().parents[1] / "Data"

builder = (
    SparkSession.builder
    .appName("bronze_ingest")
    .master("local[*]")
    .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
    .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog")
)
spark = configure_spark_with_delta_pip(
    builder,
    extra_packages=["org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.3"],
).getOrCreate()


def ingest_topic(spark, topic):
    name = topic.replace("raw.", "")                  # "raw.standings" -> "standings"
    bronze_path = str(BASE / "bronze" / name)
    checkpoint_path = str(BASE / "checkpoints" / f"bronze_{name}")

    raw = (
        spark.readStream
        .format("kafka")
        .option("kafka.bootstrap.servers", "localhost:9092")
        .option("subscribe", topic)                   # the topic passed in, not hardcoded
        .option("startingOffsets", "earliest")
        .load()
    )

    bronze = raw.select(
        col("key").cast("string").alias("key"),
        col("value").cast("string").alias("value"),
        col("topic"),
        col("partition"),
        col("offset"),
        col("timestamp"),
        current_timestamp().alias("_ingested_at"),
    )

    query = (
        bronze.writeStream
        .format("delta")
        .outputMode("append")
        .option("checkpointLocation", checkpoint_path)
        .trigger(availableNow=True)
        .start(bronze_path)
    )
    query.awaitTermination()

    count = spark.read.format("delta").load(bronze_path).count()
    print(f"{topic}: {count} rows in Bronze")


TOPICS = ["raw.matches", "raw.standings", "raw.scorers", "raw.teams"]
for topic in TOPICS:
    ingest_topic(spark, topic)

spark.stop()