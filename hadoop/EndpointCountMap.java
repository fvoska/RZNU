import java.io.IOException;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapred.MapReduceBase;
import org.apache.hadoop.mapred.Mapper;
import org.apache.hadoop.mapred.OutputCollector;
import org.apache.hadoop.mapred.Reporter;

public class EndpointCountMap extends MapReduceBase
implements Mapper<LongWritable, Text, Text, IntWritable> {
    private static final int THRESHOLD = 5;

    public void map(LongWritable key, Text value,
    OutputCollector<Text, IntWritable> output,
    Reporter reporter)
    throws IOException {
        String[] parts = (value.toString()).split("\t");
        String endpoint = parts[1];
        output.collect(new Text(endpoint), new IntWritable(1));
    }
}
