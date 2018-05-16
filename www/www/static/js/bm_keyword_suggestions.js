var NUM_VIS_PAGES = 5; /*currently showing all the division data*/
var H_TYPE = 'section';
var CLASSIFIER_ID = 'Au1';
var REGION = 'AU';
var CURRENT_PAGE = 1
var RESULTS_PER_PAGE = 20;
var GRID_DATA = {};
var DATA_TYPES = {'dl_classifiers': 'Deep learning classifiers'};
var CLASSIFIER_DATA = {};

$(document).ready(function() {
    //get the dl_classifiers
    var url = "/demo/dl_classifiers/";
    $.get(url, function(data, status){
    GRID_DATA["dl_classifiers"] = JSON.parse(data)
    if(status=="success")
        set_option_grid('dl_classifiers');
    });
});

function compare_results(id){
    CLASSIFIER_IDS = [];
    var classifer_keyword_ajax = [];
    var selected_opt_ids = $("#dl_classifiers-row .tile.selected");
    var model_keyword_url = "/demo/get_model_keywords/";
    $.each(selected_opt_ids, function(){
         var classifier_id =  JSON.parse($("#" + this.id).attr('data'))['opt_id'];
            CLASSIFIER_IDS.push(classifier_id);
            if(CLASSIFIER_DATA[classifier_id] == undefined)
            {
                var ajax_req = $.post(model_keyword_url, JSON.stringify({'classifier_id': classifier_id, 'h_type': H_TYPE}),  function(data, status) {
                    if(status=="success") {
                        CLASSIFIER_DATA[classifier_id] = JSON.parse(data);
                    }
                });
                classifer_keyword_ajax.push(ajax_req);
            }
    });
    CURRENT_PAGE = 1;
    $.when(classifer_keyword_ajax).done(function (temp) {
        $.when(set_results(CURRENT_PAGE)).done(function (data) {
            var bm_data = JSON.parse(data)
            $('.page-selector').twbsPagination({
                totalPages: bm_data['total_pages'].toString(),
                visiblePages: NUM_VIS_PAGES.toString(),
                onPageClick: function (event, page) {
                    set_results(page);
                }
            });
        });
    });
}

function set_results(page)
{
    CURRENT_PAGE = page;
    var bmc_data_url = '/demo/bm_keyword_suggestions/get_results/'
    return  $.post(bmc_data_url, JSON.stringify({'classifier_ids': CLASSIFIER_IDS, 'h_type': H_TYPE, 'results_per_page': RESULTS_PER_PAGE, 'current_page': CURRENT_PAGE }),  function(data, status) {
        if(status=="success") {
            var bm_data = JSON.parse(data);
            set_page_content(bm_data);
            }
    });
}

function show_popup_alert(alert_title, alert_disc)
{
	$("#alert_title").html(alert_title);
	$("#alert_disc").html(alert_disc);
	$('#popup-alert').modal({
     	show: 'true'
    });
}

//select list of classifiers and apis - to select by user
function select_opt(id){
	var current_id = $("#"+ id);
    var opt_data = JSON.parse(current_id.attr('data'));
    var data_type = opt_data['data_type'];
    var opt_id = opt_data['opt_id'];
	var selected_ids = $(".tile.selected");
    var selected_data_type_ids = $("#" + data_type + "-row .tile.selected");

    var max_limt = GRID_DATA[data_type].max_limit;
	if(((current_id.hasClass('selected') == false)  && selected_data_type_ids.length < max_limt) || ($("#"+ id).hasClass('selected') && selected_ids.length > 1))
		$("#"+ id).toggleClass('selected');
	else{
		alert_title = "Error in selection!!!";
		if(selected_ids.length <=1)
		{
			alert_title ="Error in Un-selection !!!"
			alert_disc = "Need to select atleast one algorithm to see the results."
		}
		if(selected_data_type_ids.length >= max_limt)
		{
			alert_title ="Error in selection !!!"
			alert_disc = "You can only compare maximum of "+ max_limit +" algorithms to compare the results."
		}
		show_popup_alert(alert_title, alert_disc);
	}
}

// visualise grid of algorithms to chose from
function set_option_grid(data_type)
{
    var grid_html = "";
    grid_opts = GRID_DATA[data_type].opts
	for(var opt_id in grid_opts)
	{
        var opt_data = JSON.stringify({'data_type': data_type, 'opt_id': opt_id});
		var opt_text = grid_opts[opt_id]['text'];
		var opt_disc = grid_opts[opt_id]['description'];
		grid_html += "<a id='a-"+ opt_id +"' class='tile' data=" + opt_data + " data-toggle='modal' data-placement='auto' title='"+ opt_disc+"' onclick='select_opt(this.id)'><div class='title'>" + opt_text + "</div></a>";
	}
	$("#"+data_type + "-row").html(grid_html);
	$('[data-toggle="tooltip"]').tooltip();
	//set the default options
    if(GRID_DATA[data_type].default_opt != "")
	    select_opt("a-" + GRID_DATA[data_type].default_opt);
}



//set the HSL colours for confidence
function percentToHSL(percent) {
    var h = 210;
    var s = 100 + "%";
    var l = 90 - (Math.floor((percent / 100 * 70))) + "%";
    hsl_colour = "hsl(" + h + "," + s + "," + l + ")";
    return hsl_colour;
}

function set_page_content(bm_data)
{
    var results = bm_data['results'];
    $results_table =  $("#results-table");
    $results_table.html("");
    var $header_row = $("<tr><th>Image</th><th> GTS</th></tr>").appendTo($results_table);
    for(cls_id in CLASSIFIER_IDS)
        $header_row.append("<th>"+ CLASSIFIER_IDS[cls_id] + "</th>");
    
    var page_html = "";
    for(var i in results)
    {
        var tmid = results[i]['image_url'];
        var gts = results[i]['gts'];
        image_path =  STATIC_URL  +  image_url;
        page_html += "<tr>\
                    <td> <div class='img-tile'><img src=" + image_path + "></div></td>\
                    <td><ul>";
        //set gts contents
        for(var gt in gts)
            page_html += "<li><div class='ul-left'>" + gts[gt] + "</div></li>";

        page_html += "</ul></td>";
        for(cls_id in CLASSIFIER_IDS)
        {
            page_html += "<td><ul>"
            var ests = results[i][CLASSIFIER_IDS[cls_id]]; 
            ests = ests.sort(function(a, b) { return b[1] - a[1]});
            for(var est in ests)
            {
                var percent = Math.floor(parseFloat(ests[est][1])*100);
                var est_str = ests[est][0];
                var style_str = "style= 'width: "+ percent+ "%; background : linear-gradient(to right," + percentToHSL(0, 'b') + "," + percentToHSL(percent/2, 'b') + ")'";
                page_html += "<li><div class='ul-left'>" + est_str + "</div>\
                                <div class='ul-right progress'>\
                                    <div " + style_str + " ></div>\
                                </div>\
                            </li>";
            }
            page_html += "</ul></td>";
        }
        page_html += "</tr>";
    }
    $results_table.append(page_html);
}

// function set_keywords(tmid)
// {
//     $(".selected").removeClass("selected");
//     $("#imga-" + tmid).toggleClass('selected');
//     var keyword_data = ALLKEYWORDS_DATA[classifier_id][h_type];
//     var ests_ids = BM_KEYWORD_DATA[tmid]["ests"]
//     var gts_ids = BM_KEYWORD_DATA[tmid]["gts"]

//     var details_html = "<tr style='text-align:center;'><th colspan='2'>Classifier: " + classifier_id + "</th></tr>\
//                         <tr><th colspan='2'> Ground-truth keywords</th><tr>"
//     for(var gts in gts_ids){
//         var code = keyword_data[gts_ids[gts]]['keyword'] +  " : " 
//         var detail = keyword_data[gts_ids[gts]]['detail'];
//         details_html += "<tr><td>" + code + "</td><td>" + detail + "</td></tr>";
//     }
//     details_html += "<tr><th colspan='2'> Suggested keywords</th><tr>"
//     for(var ests in ests_ids){
//         var code = keyword_data[ests_ids[ests]]['keyword'] +  " : " 
//         var detail = keyword_data[ests_ids[ests]]['detail'];
//         details_html += "<tr><td>" + code + "</td><td>" + detail + "</td></tr>";
//     }
//     $("#detail-content").html(details_html)

// }
