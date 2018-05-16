var ALLKEYWORDS_DATA = {};
var VC_US_MAP = {};
var VC_US_RANKS = {};
var VC_DIV = []
var NUM_VIS_PAGES = 40; /*currently showing all the division data*/

$(document).ready(function (){
	$('#page-content').html("<i class='fa fa-spinner fa-spin'></i> Loading data...");
	get_allkeywords();
	get_vcus_map();
	$(document).ajaxStop(function () {
		set_selector();
  	});
});

function set_selector()
{
	VC_DIV = Object.keys(VC_US_RANKS).sort();
	var total_pages = VC_DIV.length;
    $('#page-selector').twbsPagination({
        totalPages: total_pages.toString(),
        visiblePages: 10,
        onPageClick: function (event, page) {
        	set_page_content(page);
        }
    });
}

function set_page_content(page)
{
	var content_str = 	"<table class='fullwidth'>\
							<tr>\
								<th class='code ctxt'>VC code</th>\
								<th class='code ctxt'>Selected US codes</th>\
								<th class='code ctxt'>US codes</th>\
							</tr>";

	var page_data = VC_US_RANKS[VC_DIV[page-1]]
	var vc_codes = Object.keys(page_data).sort()
	var count = 0; //unique number for each us_code
	for(i in vc_codes)
	{
		var vc_code = vc_codes[i];
		var us_codes = page_data[vc_code]//.sort();
		var vc_str = vc_code + "-" +  ALLKEYWORDS_DATA['VC'][vc_code]; 
		content_str += "<tr>\
							<td id='td-"+ vc_code +"' class='code vc'>\
								<div class='txtblock'>" + vc_str +"\
								</div>\
							</td>\
							<td id='sl-"+ vc_code +"' class='code sl' ondrop='drop(event)' ondragover='allowDrop(event)'>";
		var mapped_us_codes = VC_US_MAP[vc_code];

		for(var k in mapped_us_codes)
		{
			var id_str = "a-" + mapped_us_codes[k] + "-" + count;
			count +=1;
			var us_str =  mapped_us_codes[k] + "-" + ALLKEYWORDS_DATA['US'][mapped_us_codes[k]];
			content_str	+= "<a id='"+ id_str + "' class='txtblock' draggable='true' ondragstart='drag(event)'>" + us_str +"\
							</a>";
		}
		content_str += "</td>\
						<td id='sg-"+ vc_code +"' class='code sg' ondrop='drop(event)' ondragover='allowDrop(event)'>"
		for(var j in us_codes)
		{
			var id_str = "a-" +  us_codes[j] + "-" + count;
			count +=1;
			var us_str = us_codes[j] + "-" + ALLKEYWORDS_DATA['US'][us_codes[j]];
			content_str += "<a id='"+ id_str + "' class='txtblock' draggable='true' ondragstart='drag(event)'>" + us_str +"\
							</a>"
		}
		content_str +=  "</td></tr>"
	}
	content_str +="</table>";
	$('#page-content').html(content_str);

}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var us_code = data.substring(data.indexOf("-")+1, data.lastIndexOf("-"));
	var vc_code = ev.target.id.slice(3);
	var target =  ev.target.id.slice(0,2);
	console.log(us_code);
	console.log(vc_code);
	console.log(target);

	if(ev.target.nodeName=="TD")
	{
    	ev.target.appendChild(document.getElementById(data));
    	if(target == 'sl')
    	{
    		console.log(VC_US_MAP[vc_code]);
    		VC_US_MAP[vc_code].push(us_code);
    		console.log(VC_US_MAP[vc_code]);
    	}

    	if(target == 'sg')
    	{
    		console.log(VC_US_MAP[vc_code]);
    		var index = VC_US_MAP[vc_code].indexOf(us_code)
    		if(index > 0)
    			VC_US_MAP[vc_code].splice(index, 1);
    		console.log(VC_US_MAP[vc_code]);
    	}
	}
}

function get_allkeywords()
{
	var url = '/demo/get_allkeywords/'
	$.get(url, function(data, status){
	    if(status=="success"){
	    	ALLKEYWORDS_DATA =  JSON.parse(data);
	    	console.log("Received all keyword data");
	    }
	});
}

function get_vcus_map()
{
	var url = '/demo/set_csmapping/get_vcusmap/'
	$.get(url, function(data, status){
	    if(status=="success"){
	    	VC_US_RANKS =  JSON.parse(data)['ranks'];
	    	VC_US_MAP =  JSON.parse(data)['map'];
	    	console.log(VC_US_RANKS);
	    	console.log("Recieved VC-US cross mapping");
	    }
	});
}

function close_popup()
{
	$("#popup-success").removeClass('show');
}
function download_vcusmap(){

	// var url = '/demo/set_csmapping/update_vcusmap/'
	// $.post(url, JSON.stringify({'map': VC_US_MAP}), function(data, status){
	//     if(status=="success"){
	//     	console.log("successfully updated.");
 //    		$("#popup-success").addClass('show');
	//     }
	// });

    $("a#download").attr({
                    "download": "VC_to_US.json",
                        "href": "data:application/json;charset=utf8;base64," 
                                + window.btoa(JSON.stringify(sortObject(VC_US_MAP), undefined, 4))
    }).get(0).click();
}

function sortObject(unordered) {
	const ordered = {};
	Object.keys(unordered).sort().forEach(function(key) {
  	ordered[key] = unordered[key];
	});
	return ordered;
}
