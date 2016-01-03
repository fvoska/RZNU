import java.io.IOException;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapred.FileInputFormat;
import org.apache.hadoop.mapred.FileOutputFormat;
import org.apache.hadoop.mapred.JobClient;
import org.apache.hadoop.mapred.JobConf;

public class SortByValue {
    public static void main(String[] args) throws IOException {
        if (args.length != 2) {
            System.err.println("Usage: SortByValue <input path> <output path>");
            System.exit(-1);
        }

        JobConf conf = new JobConf(SortByValue.class);
        conf.setJobName("Sort by value");
        FileInputFormat.addInputPath(conf, new Path(args[0]));
        FileOutputFormat.setOutputPath(conf, new Path(args[1]));
        conf.setOutputKeyComparatorClass(SortByValueComparator.class);
        conf.setMapperClass(SortByValueMap.class);
        conf.setReducerClass(SortByValueReduce.class);
        conf.setOutputKeyClass(IntWritable.class);
        conf.setOutputValueClass(Text.class);
        JobClient.runJob(conf);
    }
}
