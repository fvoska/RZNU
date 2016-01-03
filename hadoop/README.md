### Setup hadoop:
[Tutorial](http://www.bogotobogo.com/Hadoop/BigData_hadoop_Install_on_ubuntu_single_node_cluster.php)

### .bashrc:
```
#HADOOP VARIABLES START
export JAVA_HOME=/usr/lib/jvm/java-8-oracle
export HADOOP_INSTALL=/usr/local/hadoop
export PATH=$PATH:$HADOOP_INSTALL/bin
export PATH=$PATH:$HADOOP_INSTALL/sbin
export HADOOP_MAPRED_HOME=$HADOOP_INSTALL
export HADOOP_COMMON_HOME=$HADOOP_INSTALL
export HADOOP_HDFS_HOME=$HADOOP_INSTALL
export YARN_HOME=$HADOOP_INSTALL
export HADOOP_COMMON_LIB_NATIVE_DIR=$HADOOP_INSTALL/lib/native
export HADOOP_OPTS="-Djava.library.path=$HADOOP_INSTALL/lib"
export HADOOP_CLASSPATH=${JAVA_HOME}/lib/tools.jar
#HADOOP VARIABLES END
```

### Prepare DFS
```
# copy log file
hadoop dfs -copyFromLocal -f /home/hduser/log.txt /log.txt
# remove output dir
hadoop dfs -rm -R /out*
```

### Compile and run

Browser count:
```
hadoop com.sun.tools.javac.Main BrowserCount*.java
jar cf BrowserCount.jar BrowserCount*.class
hadoop jar BrowserCount.jar BrowserCount /log.txt /out_browser
```

Endpoint visit count:
```
hadoop com.sun.tools.javac.Main EndpointCount*.java
jar cf EndpointCount.jar EndpointCount*.class
hadoop jar EndpointCount.jar EndpointCount /log.txt /out_endpoint
```

Secondary (descending) sorting job:
```
hadoop com.sun.tools.javac.Main SortByValue*.java
jar cf SortByValue.jar SortByValue*.class
hadoop jar SortByValue.jar SortByValue /out_endpoint/part-00000 /out_endpoint_sorted
hadoop jar SortByValue.jar SortByValue /out_browser/part-00000 /out_browser_sorted
```
