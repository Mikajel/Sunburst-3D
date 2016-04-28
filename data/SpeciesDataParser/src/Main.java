import java.io.*;
import java.util.Properties;


/**
 * Parsing specific xml structure into hierarchical JSON
 * Created by Mikajel on 22/02/2016.
 */
public class Main {
    public static void main(String[] args) throws IOException {
        convertXmlToJson();
    }

    /**
     * @param depth specifies how many tabs will be applied to string
     * @return final concatenated string
     */
    public static String tabs(Integer depth){
        String tab = "";
        for(int i = 0; i < depth; i++)
            tab = tab.concat("\t");
        return tab;
    }
    private static void convertXmlToJson() throws IOException{

        Integer linePos;
        Integer layerDepth;
        Integer maxDepth;
        String line;
        String latinName;
        Integer writeValue = 1;
        Boolean insideLeaf;
        Boolean firstNodeOfLevel;
        Boolean afterLeaf;

        //property file data stream
        Properties prop = new Properties();

        InputStream input = new FileInputStream("C:/Users/Mikajel/IdeaProjects/SpeciesDataParser/out/production/SpeciesDataParser/data.properties");
        prop.load(input);

        //Construct BufferedReader from InputStreamReader
        File inputFile = new File(prop.getProperty("input"));
        FileInputStream inputStream =
                new FileInputStream(
                        inputFile
                );
        BufferedReader br = new BufferedReader(new InputStreamReader(inputStream));

        //load the output file for writing
        File outputFile = new File(prop.getProperty("output"));
        FileOutputStream outputStream =
                new FileOutputStream(
                        outputFile
                );
        //Construct BufferedReader from InputStreamReader
        BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(outputStream));

        insideLeaf = false;
        firstNodeOfLevel = true;
        afterLeaf = false;
        layerDepth = 1;
        maxDepth = 1;
        line = br.readLine();
        linePos = Integer.parseInt(
                prop.getProperty("startLine")
        );

        //skip unnecessary lines
        for(int i = 0;
            i < Integer.parseInt(prop.getProperty("startLine")); i++){
            br.readLine();
        }

        //root element
        bw.write("{\n" +
                " \"name\": \"Mammalia\",\n" +
                " \"children\": [");

        //main cycle for processing lines from input file
        while((layerDepth >= 1) && (line != null)){
            //entering leaf node
            if(line.matches("<leaf>")){

                insideLeaf = true;
                line = br.readLine();
                linePos++;

                //hardcoded position of latin name in quotes of xml
                latinName = line.substring(36, line.indexOf("/") - 1);

                if(firstNodeOfLevel){
                    //hardcoded size of 1
                    bw.write(tabs(layerDepth + 1));
                    bw.write("{\"name\": " + "\"" + latinName + "\"" + ", \"size\": 1" + "}\n");
                }
                else{
                    bw.write(tabs(layerDepth + 1));
                    bw.write(",{\"name\": " + "\"" + latinName + "\"" + ", \"size\": 1" + "}\n");
                }
                firstNodeOfLevel = false;
            }
            //escaping leaf node
            if(line.matches("</leaf>")){
                maxDepth = layerDepth;
                insideLeaf = false;
                afterLeaf = true;
            }
            //entering sub-branch
            if(line.matches("<branch>")){
                layerDepth++;

                firstNodeOfLevel = true;
                line = br.readLine();
                linePos++;
                latinName = line.substring(36, line.indexOf("/") - 1);

                if((maxDepth >= layerDepth) || afterLeaf) {
                    bw.write(tabs(layerDepth - 1));
                    bw.write(",{\n");
                }
                else{
                    bw.write(tabs(layerDepth - 1));
                    bw.write("{\n");
                }
                bw.write(tabs(layerDepth));
                bw.write("\"name\": " + "\"" + latinName + "\"" + ",\n");
                bw.write(tabs(layerDepth));
                bw.write("\"children\": [\n");

                maxDepth = layerDepth;
            }
            //escaping sub-branch
            if(line.matches("</branch>")){
                bw.write(tabs(layerDepth));
                bw.write("]\n");

                layerDepth--;

                bw.write(tabs(layerDepth));
                bw.write("}\n");

                afterLeaf = false;
            }
            linePos++;
            line = br.readLine();
        }


        //destroy file reader/writer
        br.close();
        bw.close();

    }
}
