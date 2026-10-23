from pyspark.sql import SparkSession
from pyspark.sql.functions import col, current_timestamp

spark = SparkSession.builder \
        .appName("Hello_Spark") \
        .master("local[*]") \
        .config("spark.jars.packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.3") \
        .getOrCreate()


raw_matches_data = spark.read \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "localhost:9092") \
    .option("subscribe", "raw.matches") \
    .option("startingOffsets", "earliest") \
    .load()

raw_matches_data.printSchema()

unpack_matches = raw_matches_data.select(
    col('key').cast('String').alias('key'),
    col('value').cast('String').alias('value'),
    col('topic').alias('topic'),
    col('partition').alias('partition'),
    col('offset').alias('offset'),
    col('timestamp').alias('timestamp'),
    current_timestamp().alias('_ingested_at')
)

unpack_matches.show(2,truncate=False)

print("Count:", raw_matches_data.count())
spark.stop()