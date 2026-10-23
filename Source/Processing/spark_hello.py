from pyspark.sql import SparkSession

spark = SparkSession.builder \
        .appName("Hello_Spark") \
        .master("local[*]") \
        .getOrCreate()

data = [('Real Madrid','1st'),('FC Barcelona','2nd'),('Atletico Madrid','3rd')]
df = spark.createDataFrame(data,['team','Position'])

EliteTeams = df.filter(df.Position <= "2nd")

EliteTeams.show()
print("Partitions",df.rdd.getNumPartitions)

spark.stop()