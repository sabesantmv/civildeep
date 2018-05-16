var BM_DIR = '';
var RANK_DATA = '';
var LOADED_IMAGES = {};
var IMAGES_PER_REQUEST = 10; // The number of images retrieved when more images are requested

$(document).ready(function () {
    set_graphs();
    set_bm_table()
    document.getElementById('pop-results').style.visibility='hidden'; //or grab it by tagname etc
});

function set_graphs()
{
	var url = '/demo/bm_alldatasets/bmad_get_graph/';
	$.get(url, function(data, status){
	    if(status=="success"){
			var graph_data = JSON.parse(data);
			var types = Object.keys(graph_data);
			creat_canvases(types);
			set_canvas_data(graph_data);
	    }
	});
}
function creat_canvases(types)
{
	var div_bm_graph = document.getElementById('bm_graphs');
	div_bm_graph.style.display = 'block';
	var bm_graph_html = "";
	count = 0;
	bm_graph_html+="<div class='row'>";
	for(i in types)
	{
		bm_graph_html +="\
				        <div class='col-md-4'>\
				          <canvas id=chart-"+ types[i] +" width='100%'' height='80%'></canvas>\
				        </div>";
		if(count%3 == 0 && count > 0)
		{
			bm_graph_html+="</div>";
			if(count != types.length)
				bm_graph_html+="<div class='row'>";
		}
		count +=1;
	}
	$("#bm_graphs").html(bm_graph_html);
}

function set_canvas_data(bm_data)
{
	for(key in bm_data)
	{
		var canvas = document.getElementById('chart-'+ key).getContext('2d');
		var exactChart = new Chart(canvas, {
	    	type: "bar",
	    	data: bm_data[key], 
	    	options: { 	scales: { xAxes: [{ scaleLabel: { display: true, labelString: key}}]
								},
						// legend: { display: false}
	    	}
		});
	}

}

function set_bm_table()
{
	var url = '/demo/bm_alldatasets/bmad_get_data/';
	$("#bm").html("<i class='fa fa-spinner fa-spin'></i> Loading images...");
	$.get(url, function(data, status){
	    if(status=="success"){
			RANK_DATA = JSON.parse(data);
			set_data_to_bm_table();
	    }
	});

}

// function set_data_to_bm_table()
// {
// 	var feat_types = ['svm', 'deep_svm'];
// 	var table_bm = document.getElementById('table-bm');
//    	for(probe_fname in  RANK_DATA){
//    		probe = RANK_DATA[probe_fname];
//     	var is_probe_im_set = false;
//     	image_path = STATIC_URL + 'unique-logos/' + probe_fname;

//     	for(i in feat_types){
//     		feat_type = feat_types[i];
//     		g_ids = probe[feat_type];

//     		var row_key = probe_fname + ',' +  feat_type;

//     		var tr_str = "<tr id=tr-" + row_key + ">";
// 	        if(is_probe_im_set == false){
//         		tr_str += 	"<td class='bm' rowspan='" + feat_types.length + "'>\
//         		           		<img class='prb' src=" + "'" + image_path + "' alt='"+  probe_fname +"' width=100px height=100px>\
//        						</td>\
//        						<td class='bm'><p>" + feat_type + "</p></td>";
//        			is_probe_im_set = true;
//         	}
//       		tr_str +="</tr>"
//       		// console.log(tr_str);
// 			table_bm.innerHTML += tr_str;
// 			LOADED_IMAGES[row_key] = 0;
// 			load_gallery_data(row_key, g_ids);
//     	}

//    	}

// 	$("#bm").floatingScroll();
// }


function set_data_to_bm_table()
{
	var num_of_images = 20;
	var feat_types = ['svm', 'deep_and_svm', 'deep_in_svm'];
	image_table_str = "<table class='bm'>";
   	for(probe_fname in  RANK_DATA){
   		probe = RANK_DATA[probe_fname];
    	var is_probe_im_set = false;
    	image_path = STATIC_URL + 'unique-logos/' + probe_fname;

    	for(i in feat_types){
    		var feat_type = feat_types[i];
    		var results = probe[feat_type]['results'];

    		var row_key = probe_fname + ',' +  feat_type;

    		image_table_str += "<tr id=tr-" + row_key + ">";
	        if(is_probe_im_set == false){
        		image_table_str += "<td class='bm' rowspan='" + feat_types.length + "'>\
        		        				<div class='prb'><img class='prb' src=" + "'" + image_path + "' title='"+  probe_fname +"'></div>\
       								</td>";
       			is_probe_im_set = true;

        	}
        	image_table_str +="<td class='bm'>\
        						<h4 class='ttl'><b>"+ feat_type +"</b></h4>\
        						<a class='bm' id=stat-a-" + row_key + " class='grid-image' href= '#pop-results' onclick='show_stats(this.id)'><h5 class='ttl'>stats</h5>\
        						<a class='bm' id=rel-a-" + row_key + " class='grid-image' href= '#pop-results' onclick='show_relevant_keywords(this.id)'><h5 class='ttl'>relevant_keywords</h5>\
        						<a class='bm' id=deep-a-" + row_key + " class='grid-image' href= '#pop-results' onclick='show_deep_keywords(this.id)'><h5 class='ttl'>deep_keywords</h5>\
     						   </td>"

        	var slice_end = Math.min(results.length, num_of_images);
        	var results_set = results.slice(0, slice_end);
        	for(j in results_set){
        		region = results_set[j]['dataset']
        		tmid = results_set[j]['tmid']
        		g_id = region + '-' + tmid;
        		image_path =  'http://tmv.io/lm/tmimage_trim96/' + region + '/' +  tmid
	      		image_table_str += "<td class='bm'>\
       		        				<div class='prb'><img class='prb' src=" + "'" + image_path + "' title='"+  g_id +"'></div>\
	      					</td>";
          	}

          	LOADED_IMAGES[row_key] = slice_end; 
          	if(LOADED_IMAGES[row_key] < results.length)
          	{
          		image_table_str += "<td id='td-"+ row_key + "' class='bm'>\
          								<div class='prb' style='background: url(" + "" + ") " + 0 + 'px ' + 0 + "px;'>\
											<a class='bm' id=a-" + row_key + " class='grid-image' onclick='more_image_click(this.id)'><h1>+</h1>\
                                    		</a>\
          		 						</div>\
          		 					</td>";
          	}
      		image_table_str +="</tr>"

    	}

   	}

  	image_table_str +="</table>"

	$("#bm").html(image_table_str);
	$("#bm").floatingScroll();
}

function disableScrolling(){
    var x=window.scrollX;
    var y=window.scrollY;
    window.onscroll=function(){window.scrollTo(x, y);};
}

function enableScrolling(){
    window.onscroll=function(){};
    document.getElementById('pop-results').style.visibility='hidden'; //or grab it by tagname etc
}


function show_relevant_keywords(id)
{
	document.getElementById('pop-results').style.visibility='visible'; //or grab it by tagname etc
	var row_key = id.slice(6);
	var ind = row_key.search(',');
	var probe_fname = row_key.slice(0, ind);
	var feat_type = row_key.slice(ind +1);

	keywords_results = RANK_DATA[probe_fname][feat_type]['suggested keywords'];
	var results_tab_str = "<table class='results'>"
	results_tab_str +=  "<tr>\
				   	 		<th class='results'>Keyword</th><th class='results'>Confidence</th><th class='results'>Stats</th>\
				   	    </tr>";
	for(i in keywords_results)
	{
		var key = keywords_results[i]['keyword'];
		var conf = keywords_results[i]['confidence'].toFixed(4);
		var stats = keywords_results[i]['stats']
		var stat_str = '';
		for(i in stats)
			stat_str += ', ' +  stats[i].toFixed(2);
		stat_str = '[' + stat_str.slice(1) + ']';

		results_tab_str +="<tr class='results'>\
						   	 <td class='results'>"+ key + "</td>\
						   	 <td class='results'>" + conf + "</td>\
						   	 <td class='results'>" + stat_str + "</td>\
						   </tr>";
	}
	results_tab_str +="</table>";
	document.getElementById("pop-content").innerHTML = results_tab_str;
}

function show_deep_keywords(id)
{
	document.getElementById('pop-results').style.visibility='visible'; //or grab it by tagname etc
	var row_key = id.slice(7);
	var ind = row_key.search(',');
	var probe_fname = row_key.slice(0, ind);
	var feat_type = row_key.slice(ind +1);

	keywords_results = RANK_DATA[probe_fname][feat_type]['deep keywords'];
	var results_tab_str = "<table class='results'>"
	results_tab_str +=  "<tr>\
				   	 		<th class='results'>Keyword</th><th class='results'>Confidence</th>\
				   	    </tr>";
	for(i in keywords_results)
	{
		var key = keywords_results[i]['keyword'];
		var conf = keywords_results[i]['confidence'];

		results_tab_str +="<tr class='results'>\
						   	 <td class='results'>"+ key + "</td>\
						   	 <td class='results'>" + conf + "</td>\
						   </tr>";
	}
	results_tab_str +="</table>";
	document.getElementById("pop-content").innerHTML = results_tab_str;
}

function load_gallery_data(row_key, g_ids)
{
	var slice_end = Math.min(g_ids.length,  LOADED_IMAGES[row_key] + IMAGES_PER_REQUEST);
  	var g_id_set = g_ids.slice(LOADED_IMAGES[row_key], slice_end);

  	var tr_str = '';
	for(var j in g_id_set){
		var region = g_id_set[j]['dataset'];
		var tmid = g_id_set[j]['tmid'];
		var g_id = region + '-' + tmid;
		var image_path =  'http://tmv.io/lm/tmimage_trim96/' + region + '/' +  tmid;
  		tr_str += "<td class='bm'>\
		        		<div class='prb'><img class='prb' src=" + "'" + image_path + "' title='"+  g_id +"'></div>\
  					</td>";
  	}

  	LOADED_IMAGES[row_key] = slice_end;

  	if(LOADED_IMAGES[row_key] < g_ids.length)
  	{
  		tr_str += "<td id='td-"+ row_key + "' class='bm'>\
  						<div class='prb' style='background: url(" + "" + ") " + 0 + 'px ' + 0 + "px;'>\
							<a class='bm' id=a-" + row_key + " class='grid-image' onclick='more_image_click(this.id)'><h1>+</h1>\
                            </a>\
  		 				</div>\
  		 			</td>";
  	}
  	document.getElementById('tr-' + row_key).innerHTML += tr_str;
  	$("#bm").floatingScroll();
}


function more_image_click(id)
{
	var row_key = id.slice(2);
	document.getElementById('td-' + row_key).remove();
	var ind = row_key.search(',');
	var probe_fname = row_key.slice(0, ind);
	var feat_type = row_key.slice(ind +1);

	g_ids = RANK_DATA[probe_fname][feat_type]['results']
	load_gallery_data(row_key, g_ids);
}
