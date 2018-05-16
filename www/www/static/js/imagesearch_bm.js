var BM_TYPE = 'bm1'; //option to be given to the user to select
var PROBE_DATA = '';
var GALLERY_DATA = '';
var BM_DIR = '';
var SELECTED_FEAT_TYPES = '';
var RANK_DATA = '';

$(document).ready(function () {
    set_graphs();
	set_feat_types_table();
	set_benchmark_types();
});

function get_bm_dir()
{
	//get the bm_dir
	var url = '/demo/bm_imagesearch/get_bm_dir/'
	$.post(url, JSON.stringify({'bm_type': BM_TYPE}), function(data, status){
	    if(status=="success"){
	    	BM_DIR =  JSON.parse(data)['bm_dir'];
	    }
	});
}


function get_gallery()
{
	var url = '/demo/bm_imagesearch/get_gallery/'
	$.post(url, JSON.stringify({'bm_type': BM_TYPE}),  function(data, status){
	    if(status=="success"){
	    	GALLERY_DATA =  JSON.parse(data);
	    }
	});
}


function get_probe()
{
	var url = '/demo/bm_imagesearch/get_probe/'
	$.post(url, JSON.stringify({'bm_type': BM_TYPE}),  function(data, status){
	    if(status=="success"){
	    	PROBE_DATA =  JSON.parse(data);
	    }
	});
}

function get_rank()
{
    console.log(SELECTED_FEAT_TYPES);
    SELECTED_FEAT_TYPES = [];
    RANK_DATA = []
    $.each($('#feat_types-table tbody tr.selected'), function() {
            SELECTED_FEAT_TYPES.push($(this).find('td').eq(1).text())
    });

	var url = '/demo/bm_imagesearch/get_rank/'
	$.post(url, JSON.stringify({'bm_type': BM_TYPE, 'feat_types': SELECTED_FEAT_TYPES}),  function(data, status){
	    if(status=="success"){
	    	RANK_DATA =  JSON.parse(data);
	    }
	});
}


function set_benchmark_types()
{
	var url = '/demo/bm_imagesearch/get_bm_types/'
	$.get(url, function(data, status){
	    if(status=="success"){
			var bm_types = JSON.parse(data).bm_types
			var bm_types_html = '';
			for(key in bm_types)
			{
                var info = bm_types[key];
        		bm_types_html += "<div class='row text-center' style='padding-bottom: 10px'>\
        							<div class='col-md-offset-4 col-md-4'>\
								  		<button id= but-"+  key +" type='button' style='width:90%' onclick='compare_image_results(this.id)'' class='btn btn-info'>"+ key + " (" + info + ")</button>\
								  	</div>\
								  </div>";
			}
			$("#bm_types").html(bm_types_html)
		}
	});

}

function set_graphs()
{
	div_bm_graph = document.getElementById('bm_graphs');
	div_bm_graph.style.display = 'block';
	// $("#bm_graphs")[0].style.display = 'block';
	var url = '/demo/bm_imagesearch/get_graph/'
	$.post(url, JSON.stringify({'bm_type': BM_TYPE}), function(data, status){
	    if(status=="success"){
			var json_data = JSON.parse(data)
			var canvas_roc = document.getElementById('chart-roc').getContext('2d');
			var canvas_ap = document.getElementById('chart-ap').getContext('2d');
			var canvas_rank = document.getElementById('chart-rank').getContext('2d');
 			$("#div-loading").remove();
			var rocChart = new Chart(canvas_roc , {
		    	type: "line",
		    	data: json_data.roc, 
		    	options: { elements: { 	point: {radius: 0, hitRadius: 1, hoverRadius: 4 } ,
		    						 },
							scales: { 	yAxes: [{ scaleLabel: { display: true, labelString: 'TP Rate'}}],
										xAxes: [{ scaleLabel: { display: true, labelString: 'Number of gallery images'}}]
									},
							legend: { display: false}
		    			 },
			});

			var apChart = new Chart(canvas_ap , {
		    	type: "bar",
		    	data: json_data.ap, 
		    	options: { 	scales: { xAxes: [{ scaleLabel: { display: true, labelString: 'Average Precision'}}]
									},
							legend: { display: false}
		    	}
			});

			var rankChart = new Chart(canvas_rank , {
		    	type: "bar",
		    	data: json_data.rank, 
		    	options: { 	scales: { xAxes: [{ scaleLabel: { display: true, labelString: 'Rank'}}]
									},
							legend: { display: false}
		    	}
			});

	    }
	});


}

function set_feat_types_table()
{
    var table = $('#feat_types-table').DataTable({
        'sDom': 't',
        "ordering": false
    });
    var url = "/demo/feat_types/";
    $.get(url, function(data, status){
    	var row_html = "";
        if(status=="success"){
            var json_data = JSON.parse(data)
            var feat_types = json_data.feat_types
            max_no_of_feats_to_compare = json_data.max_no_of_feats_to_compare
            default_feat_type = json_data.default_feat_type
            
            i = 1;
            var dim_feat_types = Object.keys(feat_types).length;

            for(var key in feat_types){
                // console.log(key)
                var feat_type = key;
                var feat_type_disc = feat_types[key]['disc'];

                tr_id = feat_type;
                row_html += "<tr id=" + tr_id +">\
                                <td width='10%'>\
                                    <div class='checkbox checkbox-primary' align='center'>\
                                        <input type='checkbox' id=chck-" + feat_type + ">\
                                        <label for=" + tr_id + "></label>\
                                    </div>\
                                </td>\
                                <td align='left' width='30%'><p>" +  feat_type + "</p></td>\
                                <td><p>" + feat_type_disc + "</p></td>\
                            </tr>";

            }
            $("#feat_types-body").html(row_html)
            
            $.each($('#feat_types-table tbody tr'), function() {
                if($(this).find(":checkbox").prop("id") == "chck-" + default_feat_type){
                     $(this).toggleClass('selected'); //unselect
                     $(this).find(":checkbox").prop("checked", true);
                }
            });

            $('#feat_types-table tbody tr').on('click', function () {
                console.log($('#feat_types-table tbody tr.selected').length)
                if ($('#feat_types-table tbody tr.selected').length >= max_no_of_feats_to_compare)
                {
                    $(this).find(":checkbox").prop("checked", false)
                    if($(this).hasClass('selected')){
                        $(this).toggleClass('selected'); //unselect
                    }
                }
                else{

                    if($(this).hasClass('selected')){
                        $(this).find(":checkbox").prop("checked", false);
                    }
                    else{
                        $(this).find(":checkbox").prop("checked", true);
                    }
                    $(this).toggleClass('selected'); //unselect
                }
            });
        }


    });
}

function set_bm_table()
{
	image_table_str = "<table class='bm'>"
   	for(i in  PROBE_DATA){
   		probe = PROBE_DATA[i];
    	var is_probe_im_set = false;
    	for(rr in SELECTED_FEAT_TYPES){
    		feat_type = SELECTED_FEAT_TYPES[rr];
    		rank = RANK_DATA[feat_type][i];
    		image_table_str += "<tr>";

	        if(is_probe_im_set == false){
        		image_table_str += "<td class='bm' rowspan='" + SELECTED_FEAT_TYPES.length + "'>\
        								<div class='prb' style='background: url(" + STATIC_URL + BM_DIR + probe.spirate[0] + ") " + probe.spirate[2] + 'px ' + probe.spirate[1] + "px;'>\
        								</div>\
       								</td>";
       			is_probe_im_set = true;
        	}
        	image_table_str +="<td class='bm'><p>" + feat_type + "</p><p>AP:" + rank['ap'] + "</p><p>RANK:" + rank['ar'] + "</p></td>"
        	g_ids = rank.rank;
        	for(j in g_ids){
        		g_id = g_ids[j];
        		gallery = GALLERY_DATA[g_id];
	      		image_table_str +="<td class='bm'><div class='gal' style='background: url(" + STATIC_URL + BM_DIR + gallery.spirate[0] + ") " + gallery.spirate[2] + 'px ' + gallery.spirate[1] + "px;'></div></td>";
        		// ##TODO
        		// if(g_id in probe.similar){
        		// 	image_table_str+= "<div class='gt'></div></div></td>"			
        		// }
        		// else{
        		// 	image_table_str+= "<div class='no-gt'></div></div></td>"			
        		// }
          	}
      		image_table_str +="</tr>"

    	}

   	}
  	image_table_str +="</table>"

	$("#bm").html(image_table_str);
	$("#bm").floatingScroll();
}

function compare_image_results(id)
{
    $("#bm").html("<i class='fa fa-spinner fa-spin'></i> Loading images...");

	BM_TYPE = id.replace('but-', '');
	if(BM_DIR == ''){
		get_bm_dir();
	}

	if(GALLERY_DATA == ''){
		get_gallery();
	}

	if(PROBE_DATA == ''){
		get_probe();
	}

	get_rank();

	$(document).ajaxStop(function () {
		set_bm_table();
  	});

	// $("#bm").html("<i class='fa fa-spinner fa-spin'></i> Loading images...");
	// var table_url = STATIC_URL + 'html/bm_image_table.html?v=00001'; // version numbe is added to refresh the browser for the new html file
	// console.log(table_url)
	// $.get(table_url, function(data, status){
	//     if(status=="success"){
	// 		$("#bm").html(data);
	// 		$("#bm").floatingScroll();
	//     }
	// });
	
}


