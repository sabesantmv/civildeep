var INSTACART_LABELS = [];
var NUM_VIS_PAGES = 5;
var RESULTS_PER_PAGE  =5;
var IMG_SERVER_URL = "/static/instacart/devkit/instacart_v1/";
var PAGE_DATA = {};

// var img_ids = ["22_00009", "1_00013", "22_00014", "28_00006", "2_00027", "2_00020", "30_00033", "27_00006", "25_00006", "25_00022", "2_00025", "25_00063", "32_00003", "25_00057", "30_00023", "30_00010", "22_00020", "2_00004", "30_00038", "2_00028", "28_00001", "2_00015", "22_00017", "2_00026", "23_00007", "2_00016", "30_00001", "33_00005", "23_00002", "30_00013", "25_00062", "30_00005", "27_00002", "25_00014", "32_00024", "3_00002", "25_00020", "25_00082", "22_00024", "25_00068", "25_00060", "27_00027", "1_00010", "2_00006", "5_00001", "32_00010", "25_00003", "28_00002", "25_00087", "25_00038", "mixed_00004", "25_00064", "22_00025", "30_00007"];
var INSTACART_LABELS = []

function getParameterByName(name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

$(document).ready(function() {

  var ajax_labels =  get_instacart_labels();
  var ajax_annotation_data =  get_annotation_data(0);

  $.when(ajax_labels, ajax_annotation_data).done(function(label_data, annotation_data)
	{
    var labels = JSON.parse(label_data[0]);
    var annotation_data = JSON.parse(annotation_data[0]);
    INSTACART_LABELS = []
    for(var i in labels){
      var img_thumb_url  = "";
      if(labels[i].thumb_url !== "")
        img_thumb_url = IMG_SERVER_URL + labels[i].thumb_url
      INSTACART_LABELS.push({'label': labels[i].tag,
                             'value': i,
                             'thumb_url':img_thumb_url});
    }
    $('.page-selector').twbsPagination({
        totalPages: annotation_data.total_pages.toString(),
        visiblePages: NUM_VIS_PAGES.toString(),
        onPageClick: function (event, page) {
            create_annotation_grid(page);
        }
    });
		
	});

});

function create_annotation_grid(page)
{
  $.when(get_annotation_data(page)).done(function(data)
	{
    PAGE_DATA = JSON.parse(data).page_data;
    $("#annotator_grid").html("");
    for(var i in PAGE_DATA)
    {
      var annotator_id = PAGE_DATA[i]['image_label'];
      var image_url = IMG_SERVER_URL + "annotations/images/" + annotator_id + ".png";
      var entries  =  PAGE_DATA[i]["objects"];

      var annotation_html = "<div id="+ annotator_id + " class='tile'></div>\
                            <div>\
                            </div>";
      $("#annotator_grid").append(annotation_html);
      var annotator = new BBoxAnnotator({
        url: image_url,
        id: "#" + annotator_id,
        image_label : annotator_id,
        entries: entries,
        width:800,
        height:600,
        border_width : 2,
        input_method: 'text',    // Can be one of ['text', 'select', 'fixed']
        labels: INSTACART_LABELS,
        onchange: function(image_label, entries) {
          // $("#data-" + options.id).text(JSON.stringify(entries, null, "  "));
          // PAGE_DATA[i][annotator_id].objects = entries;
          var index = PAGE_DATA.findIndex(x => x["image_label"] == image_label);
          PAGE_DATA[index]["objects"] = entries;
          console.log(PAGE_DATA[index]["objects"]); 
        }
      });
    }
  });
}

function get_instacart_labels()
{
    var url = "/demo/instacart/get_labels/";
    return $.get(url, function(data, status){
    });
}

function get_annotation_data(page){
    var url = "/demo/instacart/get_annotation_data/";
    return $.post(url, JSON.stringify({'current_page': page, 'results_per_page': RESULTS_PER_PAGE, 'page_data': PAGE_DATA}),  function(data, status){});
}

function show_info(image_label)
{
  var info_popup_id = "info_popup";
  var syntaxHighlight = function (json) {
      if (typeof json != 'string') {
          json = JSON.stringify(json, undefined, 2);
      }
      json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
          var cls = 'number';
          if (/^"/.test(match)) {
              if (/:$/.test(match)) {
                  cls = 'key';
              } else {
                  cls = 'string';
              }
          } else if (/true|false/.test(match)) {
              cls = 'boolean';
          } else if (/null/.test(match)) {
              cls = 'null';
          }
          return '<span class="' + cls + '">' + match + '</span>';
      });
  }

  var index = PAGE_DATA.findIndex(x => x["image_label"] == image_label);
  $("#info_popup").addClass("json_content")
  $("#info_popup").html("<pre></pre>");
  var json_string = JSON.stringify(PAGE_DATA[index], null, 2);
  $('#' + info_popup_id + ">pre").html(syntaxHighlight(json_string));
}



// function get_algs(){
// 	var url = '/demo/get_reranking_algs/'
// 	return $.get(url, function(data, status){
// 	});
// }




