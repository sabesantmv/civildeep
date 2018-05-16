var BM_DIR = '';
var GALLERY_IMAGES_PER_REQUEST = 15; // The number of images retrieved when more images are requested
var ALL_KEYWORDS = '';
var MAX_NUM_ALGS_TO_SELECT = 1;

var AJAX_BM_DIR = '';
var AJAX_ALL_KEYWORDS = '';


var BM_DATA = {'next_doc': 0};
var LOADED_IMAGES = {};
var SELECTED_ALGS = [];

//initialise the global variables
function init_bm()
{
	BM_DATA = {'next_doc': 0};
	LOADED_IMAGES = {};
	SELECTED_ALGS = [];
	$("#table-bm").html("");
	$("#bm_graphs").html("");
	$("#div-bm").css({'display': 'none'});
	$("#bm_graphs").css({'display' : 'none'});
	$("#div-compare").css({"display": 'none'});
}

//set thing on document ready
$(document).ready(function () {
	var ajax_get_algs = get_algs();
	$.when(ajax_get_algs).done(function(algs_data)
	{
		viz_algs_grid(JSON.parse(algs_data));
	});
	AJAX_ALL_KEYWORDS = get_allkeywords();
	AJAX_BM_DIR = get_bm_dir();
	init_bm();
});

//get reranking algs
function get_algs(){
	var url = '/demo/get_reranking_algs/'
	return $.get(url, function(data, status){
	});
}

//get all keywords
function get_allkeywords()
{
	var url = '/demo/get_allkeywords/'
	return $.get(url, function(data, status){
	});
}

//get the bm_dir
function get_bm_dir()
{
	var url = '/demo/bm_reranking/get_bm_dir/'
	return $.post(url, JSON.stringify({'bm_type': ''}), function(data, status){
	});
}

//get the graph data
function get_graph_data(probe_id)
{
	var url = '/demo/bm_reranking/get_graph/';
	return $.post(url, JSON.stringify({'algs': SELECTED_ALGS, 'probe_id' : probe_id}), function(data, status){
	});
}

//get the bm data
function get_bm_data()
{
	var url = '/demo/bm_reranking/get_bm_data/';
	return $.post(url, JSON.stringify({"next_doc": BM_DATA['next_doc'], algs: SELECTED_ALGS}), function(data, status){
        console.log(status);
        if(status=="success"){
            $("#prb-dots").css({'display':"none"});
            $("#prb-load").css({'display':'block'});
            if($("#prb-rhombus").hasClass("loading"))
                $("#prb-rhombus").toggleClass("loading");
        }
	});
}
//set the convases and visualise graphs
function viz_graphs(graph_data, id, graph_width='100%', graph_height='60%')
{
	//set canvases to draw graphs
	function set_canvases(graph_data, id)
	{
		var types = Object.keys(graph_data);
		console.log(types);
		var div_bm_graph = document.getElementById(id);
		div_bm_graph.style.display = 'block';
		var bm_graph_html = "";
		count = 0;
		bm_graph_html+="<div class='row'>";
		for(i in types)
		{
			bm_graph_html +="\
							<div class='col-md-4'>\
							<canvas id="+ id +"-chart-"+ types[i] +" width="+ graph_width + " height="+  graph_height +"></canvas>\
							</div>";
			if(count%3 == 0 && count > 0)
			{
				bm_graph_html+="</div>";
				if(count != types.length)
					bm_graph_html+="<div class='row'>";
			}
			count +=1;
		}
		$("#"+ id).html(bm_graph_html);
	}

	//draw graphs
	set_canvases(graph_data, id, graph_width, graph_height);
	for(key in graph_data)
	{
		var canvas = document.getElementById(id + '-chart-'+ key).getContext('2d');
		var exactChart = new Chart(canvas, {
	    	type: "bar",
	    	data: graph_data[key], 
	    	options: { 	scales: { xAxes: [{ scaleLabel: { display: true, labelString: key}}]
								},
						 legend: { display: true}
	    	}
		});
	}
}

//visualise reulsts  - ranked gallery images for probe images
function viz_gallery_probe(bm_data)
{
	$("#div-bm").css({'display': 'block'});
	var probe_data= bm_data['probe_data'];
	for(key in  probe_data){
   		var probe = probe_data[key];
    	var is_probe_im_set = false;

    	for(i in SELECTED_ALGS){
    		var feat_type = SELECTED_ALGS[i];
    		var row_key = key + '__' +  feat_type;
    		var image_table_str = "<tr id=tr-" + row_key + ">";
	        if(is_probe_im_set == false){
        		image_table_str += "<td class='prb' rowspan='" + SELECTED_ALGS.length + "'>\
    									<a id=prb-a-"+ key +" style='background: url(" + STATIC_URL + BM_DIR + probe.spirate[0] + ") " + probe.spirate[2] + 'px ' + probe.spirate[1] + "px;'\
										href= '#pop-results' onclick='show_probe_details(this.id)'>\
        								</a>\
									</td>";
       			is_probe_im_set = true;

        	}
        	image_table_str +="<td>\
								<div class= box>\
								<a id=met-a-" + row_key + " href= '#pop-results' onclick='show_rank_metrics(this.id)'>"+feat_type+"</a>\
								</div>\
     						   </td></tr>"
			$("#table-bm").append(image_table_str);
			set_gallery_row(key, feat_type);
      	 }

   	}

    var load_more = document.getElementById('load-more-probes');

	if(bm_data['next_doc'] == bm_data['total_docs'])
		load_more.style.display ="none";
    else
        load_more.style.display = "block";
    $("#prb-dots").css({'display':'block'});
    $("#prb-load").css({'display': "none"});
    if($("#prb-rhombus").hasClass("loading") == false)
        $("#prb-rhombus").addClass("loading");
    AJAX_BM_DATA = get_bm_data();
}
// set gallery row for specified probe and feat_type
function set_gallery_row(key, feat_type)
{
	var probe = BM_DATA['probe_data'][key];
	var row_key = key + '__' +  feat_type;
	var results = probe['rank_data'][feat_type]['ranks'];
	var loaded_gal_images  = 0
	// if(!($.isEmptyObject(LOADED_IMAGES)))
	if (LOADED_IMAGES[row_key] !== undefined)
	{
		loaded_gal_images = LOADED_IMAGES[row_key]
	}
	// var slice_end = Math.min(results.length,  LOADED_IMAGES[row_key] + GALLERY_IMAGES_PER_REQUEST);
	var slice_end = Math.min(results.length,  loaded_gal_images + GALLERY_IMAGES_PER_REQUEST);
  	var results_set = results.slice(LOADED_IMAGES[row_key], slice_end);
	var  tr_str = '';
	for(j in results_set){
		var region = results_set[j][0]
		var tmid = results_set[j][1]
		var g_title = region + '-' + tmid;
		var mark_class = '';
		var mark_id = region + '_' + tmid;
		
		//set visible dots for exact relevnat and similar marks
		if (probe['exact_marks'].indexOf(mark_id) >= 0)
			mark_class = 'mark exct';
		else if(probe['similar_marks'].indexOf(mark_id)>=0)
			mark_class = 'mark sim';
		else if(probe['relevant_marks'].indexOf(mark_id) >=0)
			mark_class = 'mark rel';

		image_path =  'http://tmv.io/lm/tmimage_trim96/' + region + '/' +  tmid
		tr_str += "<td class=gal>\
						<div class='box'>\
							<div class='" + mark_class +"'></div>\
							<img src=" + "'" + image_path + "' title='"+g_title+"'>\
						</div>\
					</td>";
		}

	LOADED_IMAGES[row_key] = slice_end; 
	if(LOADED_IMAGES[row_key] < results.length)
	{
		tr_str += "<td id='td-"+ row_key + "'>\
					<a class='load-more-container' id=a-" + row_key + " onclick='load_more_gallery(this.id)'>\
                        <div class='rhombus'></div>\
                        <div style='position:absolute; z-index:1'>\
                            <div class='load-more'>Load<br>More</div>\
                        </div>\
                    </a>\
					</td>";
	}
	document.getElementById('tr-' + row_key).innerHTML += tr_str;
  	$("#div-bm").floatingScroll();
	
	//$("#div-bm").scroll(function(){
	//	$('#load-more-probes').css({'left': $(this).scrollLeft() + $('#load-more-probes-fake').offset().left});
	//});
}

function show_popup_alert(alert_title, alert_disc)
{
	$("#alert_title").html(alert_title);
	$("#alert_disc").html(alert_disc);
	$('#popup-alert').modal({
     	show: 'true'
    });
}
//set list of algs - to select by user
function select_alg(id){
	var selected_ids = $(".tile.selected");
	var current_id = $("#"+ id); 
	if(((current_id.hasClass('selected') == false)  && selected_ids.length < MAX_NUM_ALGS_TO_SELECT) || ($("#"+ id).hasClass('selected') && selected_ids.length > 1))
		$("#"+ id).toggleClass('selected');
	else{
		alert_title = "Error in selection!!!";
		if(selected_ids.length <=1)
		{
			alert_title ="Error in Un-selection !!!"
			alert_disc = "Need to select atleast one algorithm to see the results."
		}
		if(selected_ids.length >= MAX_NUM_ALGS_TO_SELECT)
		{
			alert_title ="Error in selection !!!"
			alert_disc = "You can only compare maximum of "+ MAX_NUM_ALGS_TO_SELECT +" algorithms to compare the results."
		}
		show_popup_alert(alert_title, alert_disc);
	}

	var current_algs =[];
	$.each($(".tile.selected"), function() {
		current_algs.push($(this).context.id.slice(2));
    });

	if(current_algs.sort().join(',')=== SELECTED_ALGS.sort().join(',') || current_algs.length == 0)
		$("#div-compare").css({"display": 'none'});
	else
		$("#div-compare").css({"display": 'block'});

}
	
// visualise grid of algorithms to chose from
function viz_algs_grid(json_data)
{

    var algs_html = "";
    var algs = json_data.algs
    MAX_NUM_ALGS_TO_SELECT = json_data.max_num_algs_to_select

  	$("#" + 'alg-cap').html("Select maximum of " +  MAX_NUM_ALGS_TO_SELECT + " algs to compare.");
	for(var alg_id in algs)
	{
		var alg_text = algs[alg_id]['text'];
		var alg_disc = algs[alg_id]['discription'];
		algs_html += "<a id='a-"+ alg_id +"' class='tile' data-toggle='modal' data-placement='auto' title='"+ alg_disc+"' onclick='select_alg(this.id)'><h3>" + alg_text + "</h3></a>";
	}
	$("#algs-row").html(algs_html);
	$('[data-toggle="tooltip"]').tooltip();
	//set the default options
	select_alg("a-" + json_data.default_alg);
}

// request for more probes from server and display it
function load_more_probes()
{
	$.when(AJAX_BM_DATA).done(function (data) {
		bm_data  = JSON.parse(data);
		BM_DATA['next_doc'] = bm_data['next_doc']
		for(probe_id in bm_data['probe_data'])
		{
			BM_DATA['probe_data'][probe_id] = bm_data['probe_data'][probe_id];
		}
		viz_gallery_probe(bm_data);
        //$('#div-bm').animate({scrollLeft: $("#div-bm").offset().left},'slow');
	});
}

// load more gallery images based on the already available rank data
function load_more_gallery(id)
{
	var row_key = id.slice(2);
	document.getElementById('td-' + row_key).remove();
	var ind = row_key.search('__');
	var key = row_key.slice(0, ind);
	var feat_type = row_key.slice(ind +2);
	set_gallery_row(key, feat_type);
}
// load filtered bm data for requested algorithm 
function onclick_compare()
{
	init_bm();

	 $.each($(".tile.selected"), function() {
		SELECTED_ALGS.push($(this).context.id.slice(2));
    });

	if((SELECTED_ALGS.length) <=0)
		return;

	var ajax_graph_data = get_graph_data(-1); //-1 to get the graph data for all the probes
	var ajax_bm_data = get_bm_data();

	document.getElementById('loading-image').style.display='block';
	$.when(AJAX_BM_DIR, AJAX_ALL_KEYWORDS, ajax_graph_data, ajax_bm_data).done(function (bm_dir, all_keywords, graph_data, bm_data) {
		BM_DIR =  JSON.parse(bm_dir[0])['bm_dir'];
		BM_DATA  = JSON.parse(bm_data[0]);
		ALL_KEYWORDS =  JSON.parse(all_keywords[0]);
		viz_graphs(JSON.parse(graph_data[0]), 'bm_graphs', '100%', '60%');
    	viz_gallery_probe(BM_DATA);
		document.getElementById('pop-results').style.visibility='hidden'; //or grab it by tagname etc
	    document.getElementById('loading-image').style.display='none';
    });
}

//show probe details ( metrics, suggested keywords etc)
function show_probe_details(id)
{
	$('.prb a').removeClass('selected');
    $("#" + id).addClass('selected');
	var probe_id = id.slice(6);
	var probe = BM_DATA['probe_data'][probe_id];

	var probe_keywords = {}; 
	probe_keywords['deep_keywords'] = probe['deep_keywords'];
	probe_keywords['gt_keywords'] = probe['gt_keywords'];
	for(feat_id in SELECTED_ALGS)
		probe_keywords[SELECTED_ALGS[feat_id]] = probe['rank_data'][SELECTED_ALGS[feat_id]]['relevant_keywords']; 

	var results_tab_str = "<h3>"+ probe['name'] +"</h3> <table class='results'><col width='20%'><col width='80%'>"
	results_tab_str +=  "<tr>\
				   	 		<th class='results'>Keyword_type</th><th class='results'>Keywords</th>\
				   	    </tr>";
	for(keyword_type in probe_keywords)
	{
		results_tab_str +="<tr class='results'>\
						<td class='results td-right'>" + keyword_type +"</td><td class='td-left'>"
		var keywords = probe_keywords[keyword_type]
		for(key_id in keywords)
		{
			var region = keywords[key_id][0];
			var code = keywords[key_id][1];
			var conf = keywords[key_id][2];
			var disc = ALL_KEYWORDS[region][code];
			var percent = Math.floor(parseFloat(conf)*100);
			var bg = percentToHSL(percent, 'blue')
			var fg = percentToHSL(Math.floor((100-percent)/51) *100, 'blue')
			var div_style = "style='background: "+ bg + ";color:"+ fg +"'";
			results_tab_str += "<div class='txtblock' "+ div_style + ">"+ region + '_' + code + "<span class='disctxt'>" + disc  +"</span></div>";
		}
		results_tab_str +="</td></tr>"
	}
	results_tab_str +="</table>";
	results_tab_str +="<div id='probe_graphs' class='results'></div>";
	document.getElementById("pop-content").innerHTML = results_tab_str;
	//set the benchmark metrics:
	var ajax_graph_data = get_graph_data(probe_id);
	$.when(ajax_graph_data).done(function (graph_data) {
		graph_data = JSON.parse(graph_data);
		viz_graphs(graph_data, 'probe_graphs', '100%', '100%');
		showPopup();
	});

}


//show the rank metrics only for each algorithm
function show_rank_metrics(id)
{
	var row_key = id.slice(6);
	var ind = row_key.search('__');
	var probe_id = row_key.slice(0, ind);
	var feat_type = row_key.slice(ind +2);
	
	var probe = BM_DATA['probe_data'][probe_id];
	var metrics = probe['rank_data'][feat_type]['metrics'];
	var cmp_types = Object.keys(metrics) //exact, similar, relevant
	

	var results_tab_str = "<h3>"+ probe['name'] +"</h3> <table class='results'>\
						   <tr>\
						   <th class='results'>type</th>";	 
	var header_set = false;
	for(var cmp_id in cmp_types)
	{
		var cmp_type = cmp_types[cmp_id];
		recs = metrics[cmp_type];
		if(!header_set)
		{
			for(rec_type in recs)
				results_tab_str += "<th class='results'>"+ recs[rec_type][0] +"</th>";
			header_set = true;
			results_tab_str += "</tr>";
		}

		results_tab_str +="<tr class='results'>\
						   <td class='results '>" + cmp_type+ "</td>";

		for(var rec_type in recs)
			results_tab_str += "<td class='results '>" + recs[rec_type][1] + "/" + recs[rec_type][2] + "</td>";
	
		results_tab_str +="</tr>"
	}
	results_tab_str +="</table>";
	// $("#pop-content").html = results_tab_str;
	// $("#pop-probe_graphs").html = "";
	document.getElementById("pop-content").innerHTML = results_tab_str;
	var probe_graph = document.getElementById("probe_graphs");
	if(probe_graph != null)
		probe_graph.remove();
	showPopup();
}

//sub functions for popups
//show the popup and set the scrolling
function showPopup(disable_scroll){
	$("#pop-results").width($("#base-main").width()* 0.5);	
	$("#pop-results").css({top: $("#base-main").offset().top - 20, left: $("#base-main").offset().left + $("#base-main").width() -$("#pop-results").width()-5});
	document.getElementById('pop-results').style.visibility='visible'; //or grab it by tagname etc
	if(disable_scroll === true)
	{
    	var x=window.scrollX;
    	var y=window.scrollY;
    	window.onscroll=function(){window.scrollTo(x, y);};
	}
}
//hide the popup and remove remove the selection of selelected probe 
function closePopup(){
	$('.prb a').removeClass('selected');
    window.onscroll=function(){};
	document.getElementById('pop-results').style.visibility='hidden'; //or grab it by tagname etc    
}

//dragging popup
var dragg_popup = function(){
	return {
		move : function(divid,xpos,ypos){
			divid.style.left = xpos + 'px';
			divid.style.top = ypos + 'px';
		},
		startMoving : function(divid,container,evt){
			evt = evt || window.event;
			document.getElementById(container).style.cursor='move';
			var posX = evt.clientX,
				posY = evt.clientY,
				jqDiv = $("#" + divid.id),
				scrollLeft = $(window).scrollLeft(),
				scrollTop = $(window).scrollTop(),
				divTop = jqDiv.offset().top- scrollTop,
				divLeft = jqDiv.offset().left
				eWi = jqDiv.width(),
				eHe = jqDiv.height(),
				cWi  = $(window).width(),
				cHe  = $(window).height();
				diffX = posX - divLeft,
				diffY = posY - divTop;
			divid.onmousemove = function(evt){
				$(divid).bind('mousemove',function(evt){
					if ((evt.buttons & 1 || (evt.buttons === undefined && evt.which == 1))) {
						evt = evt || window.event;
						var posX = evt.clientX,
						posY = evt.clientY,
						aX = posX - diffX,
						aY = posY - diffY;
						if (aX < 0) aX = 0;
						if (aY < 0) aY = 0;
						if (aX + eWi > cWi) aX = cWi - eWi;
						if (aY + eHe > cHe) aY = cHe - eHe;
						dragg_popup.move(divid,aX,aY);
					}
				});
			}
		},
		stopMoving : function(container){
			var a = document.createElement('script');
			document.getElementById(container).style.cursor='default';
			document.onmousemove = function(){}
		},
	}
}();

// set the HSL colours for confidence
function percentToHSL(percent , colour_wheel) {
	var h = 210;
	var s = 100 + "%"
	var l = 90 - (Math.floor( (percent / 100 * 70))) + "%";
	if(colour_wheel=='g')
	{
		h =195;
		var l = 50 - (Math.floor( (percent / 100 * 40))) + "%";
	}

	hsl_colour =  "hsl(" + h + "," + s + "," + l + ")";
	return hsl_colour;
}