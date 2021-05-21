/////////////////////////////////////////////////////////////////////////////////////////////////
// RUT-SOM-DATA-PT-06-2020-U-C                                                    Douglas High //
// Plotly-Challenge                                                         September 28, 2020 //
//      >app.js                                                                                //
//   - read in samples.json with belly button bacterial data for array of patients, display    //
//     data to info box and charts. data shows types and amounts of microbial species (aka     //
//     operational taxonomic units, or OTUs) present in patients belly buttons.                // 
//   - populate html page.                                                                     //
//      1- fill in pull down with patient id's.                                                //
//      2- populate demographic info box with data from metadata key of file.                  //
//      3- create bar, gauge, and bubble charts.                                               //
//   - on initial load do number 1 above and number 2 and 3 for first patient on file.         //
//   - onchange processing for user choosing different patients from pull down controlled via  //
//     html, 'id="selDataset" onchange="optionChanged(this.value)"'.  numbers 2 and 3 above    //  
//     then performed for chosen patient id.                                                   //
//  *- 5/2021 - git repo and local folder name changed to BellyButtonPlotly, no code changes.  //
/////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////
//01     init function                              //
//   - extract 'names' (id#), fill dropdown box.    //
//   - generate random number for initial sample.   //
//     or call with first record.                   //
//   - call displayData to populate initial load.   //
//////////////////////////////////////////////////////

function init() {

  var dropDown = d3.select("#selDataset");

  d3.json("data/samples.json").then((data) => {
   
    data.names.forEach(function(id) {
          dropDown.append("option").text(id).property("value")
    });

    // // the following block picks a random id to do the initial load with in lieu of 
    // //   the first occurance but leaves the dropdown box blank.
    // initialId = Math.floor(Math.random() * data.names.length +1);
    // dropDown.node().value = initialId.toString()
    // optionChanged(data.names[initialId]);

    optionChanged(data.names[0]);
  });
}

//////////////////////////////////////////////////////
//02     optionChanged function                     //
//   - read in json file with promise.              //
//   - call fillMetadata to populate information.   //
//   - call buildCharts to create charts.           //
//////////////////////////////////////////////////////

function optionChanged(id){
  d3.json('data/samples.json').then((data) => {
    fillMetadata(id, data);
    buildCharts(id);    
  });
}

//////////////////////////////////////////////////////////////
//03     fillMetadata function                              //
//   - clear demographic info box and fill with metadata.   //
//   - blank out any null values.                           //
//   - quick, efficient display of keys and values.         //
//////////////////////////////////////////////////////////////

function fillMetadata(id, data){

    var metadataOut = d3.select("#sample-metadata");
    var metadataIn = data.metadata.filter(meta => meta.id == id)[0];

    metadataOut.html("");

    Object.entries(metadataIn).forEach(function ([key, value]) {
      var row = metadataOut.append("p");
      if (value == null ) {
        value = "";
      };
      row.text(`${key.toUpperCase()}: ${value} \n`);
    });
}

///////////////////////////////////////////////////
//04     buildCharts function                    //
//   - get sample data for desired patient id.   //
//   - create variables with data for charts.    //
//   - build bar, gauge and bubble charts.       //
///////////////////////////////////////////////////

function buildCharts (id){

  d3.json("data/samples.json").then((data)=> {
  
    var samples = data.samples.filter(stats => stats.id == id)[0];
    var bacteria = samples.otu_ids;
    var bacteriaNames = samples.otu_labels;
    var topBacteria = bacteria.slice(0, 10);
    var topNames = samples.otu_labels.slice(0, 10);
    var bacteriaValues = samples.sample_values;
    var topBacteriaValues = bacteriaValues.slice(0,10);
    var washFreq = data.metadata.filter(meta => meta.id == id)[0].wfreq;
    if (washFreq == null){
      washFreqText  = `No Wash Frequency Data Available for patient ${id}`;
    }
    else {
      washFreqText  = "Belly Button Weekly Washing Frequency";
    }

    //   Bar Graph
    const barTrace = {x: topBacteriaValues.reverse(),
                      y: topBacteria.map(out => `OTU_${out}`).reverse(),
                      text: topNames.reverse(),
                      marker: {color: "green"},
                      type:"bar",
                      orientation: "h"
          };
    const barData = [barTrace];
    const barLayout = {title: "Top 10 Bacteria (Operational Taxonomic Units)",
                       color: "blue",
                       xaxis: {title: "Bacterial Count"},
                       margin: {t: 100, b: 40, l:65, r:45}
          };
    Plotly.newPlot("bar", barData, barLayout);

    //  Gauge chart
    const gaugeTrace ={domain: {x: [0, 1], y: [0, 1]},
                       value: washFreq,
                       title: {text: washFreqText,
                               font: {color: "blue"}},
                       type: "indicator",
                       mode: "gauge+number",
                       gauge: {axis: {range: [null, 9],
                                      tickmode: "linear",
                                      tickfont:{color: "crimson"}
                               },
                               steps: [{range: [0, 1.5], color: "lightcyan"},
                                       {range: [1.5, 3], color: "powderblue"},
                                       {range: [3, 4.5], color: "skyblue"},
                                       {range: [4.5, 6], color: "mediumturquoise"},
                                       {range: [6, 7.5], color: "deepskyblue"},
                                       {range: [7.5, 9], color: "cornflowerblue"}]
                       }
          };
    const gaugeData = [gaugeTrace];
    const gaugeLayout = {width: 600, 
                         height: 600, 
                         margin: {t:0, b:40, l:15, r:65}
          };
    Plotly.newPlot("gauge", gaugeData, gaugeLayout);

    //     Bubble Chart
    const bubbleTrace = {x: bacteria,
                         y: bacteriaValues,
                         text: bacteriaNames,
                         mode: 'markers',
                         marker: {size: bacteriaValues,
                                  color: bacteria 
                         }
          };
    const bubbleData = [bubbleTrace];
    const bubbleLayout = {title: `Bacterial Counts  (total bacterial types found: ${bacteria.length})`,
                          paper_bgcolor: "lawngreen",
                          plot_bgcolor: "yellow",
                          gridlines: false,
                          height: 600,
                          width: 1200,
                          xaxis:{title:"Operational Taxonomic Units (OTU) IDs"},
                          yaxis:{title:"OTU    Level"}
          };
    Plotly.newPlot('bubble', bubbleData, bubbleLayout);
  });
}

///////////////////////////////
//10    Main Processing      //
//   - call init function.   //
///////////////////////////////

init();