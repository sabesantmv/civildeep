var GALLERY_DATA = [];
var PROBE_DATA =[];
var CATEGORIES = ["exact", "similar", "relevant", 'uncategorised'];
var CATEGORY_BTN_CLASSES  = {"exact": "btn-success", "similar": "btn-warning", "relevant": "btn-info" , "uncategorised": "btn-danger"};
var PROBE_DATA_CHANGED = false;
var BM_TYPE = 'bm1' //option to be given to the user to select
var BM_DIR = ''
$(document).ready(function() {
	//get the bm_dir
	var probe_url = '/demo/bm_imagesearch/get_bm_dir/'
	$.post(probe_url, JSON.stringify({'bm_type': BM_TYPE}), function(data, status){
	    if(status=="success"){
	    	BM_DIR =  JSON.parse(data)['bm_dir'];
	    }
	});
	set_probe();
	update_popup_elements();
	$("#gal_tabs").on("click", "li", function(){
		gal_popup_close();
		update_popup_elements($(this).text())
	})

});

function set_probe()
{
	var probe_url = '/demo/bm_imagesearch/get_probe/'
	$.post(probe_url, JSON.stringify({'bm_type': BM_TYPE}),  function(data, status){
	    if(status=="success"){
	    	PROBE_DATA =  JSON.parse(data);
	    	div_prb_html = "";
		    for(var key in PROBE_DATA){
		    	if(PROBE_DATA[key].hasOwnProperty('spirate')){
		    		var background_str = " style='background: url(" +  STATIC_URL + BM_DIR + PROBE_DATA[key].spirate[0] + ") " + PROBE_DATA[key]['spirate'][2] + 'px ' + PROBE_DATA[key]['spirate'][1] + "px'";
		        	div_prb_html +=   "<a id=prb-" + Object.keys(data)[key] +" class='prb' onclick='prb_img_click(this.id)'><img" + background_str  + "></a>";
		    	}
		    }
		    $("#div_prb").html(div_prb_html);
		    prb_img_click('prb-' + Object.keys(PROBE_DATA)[0]);
	    }
	});
}

function update_popup_elements(active_tab)
{
	if(typeof(active_tab) ==="undefined")
	{
		active_tab = $('.nav-tabs .active').text();
	}
	var btn_texts = _.difference(CATEGORIES, [active_tab.toLowerCase()]);
	for(i in btn_texts)
	{
		btn_text = btn_texts[i].charAt(0).toUpperCase() + btn_texts[i].slice(1);
		$("#pop-btn" + i).text(btn_text);
		$("#pop-btn" + i).removeClass($("#pop-btn" + i).attr('class'));
		$("#pop-btn" + i).addClass("btn btn-block " + CATEGORY_BTN_CLASSES[btn_texts[i]]);
	}

}

function gal_img_click(id, event)
{
	if(event.button ==0)
	{
    	$("#popup-select_cat").removeClass('show');
		var gal_id = id.replace('gal-', '')
    	$("#"+ id).toggleClass('selected');
	}

	if(event.button ==2)
	{
	    $("#popup-select_cat").addClass('show');	
	    var pos = $("#" + id).position();
	    $('#popup-select_cat').css('position', 'absolute');
		$('#popup-select_cat').css('top', pos.top + $("#"+ id).outerHeight(true)); //or wherever you want it
		$('#popup-select_cat').css('left', pos.left); //or wherever you want it
		$("#get_clicked_gal_id").val(id)
	}

}

function prb_img_click(id)
{
	gal_popup_close();
	var probe_id = id.replace('prb-', '')
	$('a.prb').removeClass('selected');
    $("#"+ id).addClass('selected');
	if(GALLERY_DATA.length ==0)
	{
	 	var gallery_url = '/demo/bm_imagesearch/get_gallery/'
		$.post(gallery_url, JSON.stringify({'bm_type': BM_TYPE}),  function(data, status){
		    if(status=="success"){
		    	GALLERY_DATA =  JSON.parse(data);
		    	set_gallery_for_probe(probe_id)
		    }
		});

	}
	else
	{
		set_gallery_for_probe(probe_id);
	}

	if(PROBE_DATA_CHANGED == true)
	{
	 	url = '/demo/bm_imagesearch/update_probe/'
	    var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.onreadystatechange = function () { 
            if (xhr.readyState == 4 && xhr.status == 200) {
               PROBE_DATA_CHANGED = false;
               console.log("successfully updated the json file");
            }
        }
        xhr.send(JSON.stringify(PROBE_DATA))  

	}

}

function set_gallery_for_probe(probe_id)
{
	//set the exact ids html
	var json_cats = ["exact", "similar", "relevant"];
	var json_ids = [];
	for(cat in json_cats)
	{
		json_cat = json_cats[cat];
		var ids = PROBE_DATA[probe_id][json_cat];
		json_ids = json_ids.concat(ids);

		if(ids == undefined)
			continue;
	    var tab_html = "";
	    for(var i in ids)
	    {
	    	var key = ids[i];
	    	if(GALLERY_DATA[key].hasOwnProperty('spirate')){
		    	var background_str = " style='background: url(" +  STATIC_URL + BM_DIR + GALLERY_DATA[key].spirate[0] + ") " + GALLERY_DATA[key]['spirate'][2] + 'px ' + GALLERY_DATA[key]['spirate'][1] + "px'";
		        tab_html+=   "<a id=gal-" + key +" class='gal' onmousedown='gal_img_click(this.id, event)' oncontextmenu='return false;'><img" + background_str  + "></a>";
		    }
		}
	    $("#tab-" + json_cat).html(tab_html);
	}

	//set the non-cat ids
    var gallery_ids = _.map(Object.keys(GALLERY_DATA), Number)
  	var non_cat_ids = _.difference(gallery_ids, json_ids);

  	var tab_uncat_html = "";
    for(var i in non_cat_ids)
    {
    	var key = non_cat_ids[i];
    	if(GALLERY_DATA[key].hasOwnProperty('spirate')){
	    	var background_str = " style='background: url(" +  STATIC_URL + BM_DIR + GALLERY_DATA[key].spirate[0] + ") " + GALLERY_DATA[key]['spirate'][2] + 'px ' + GALLERY_DATA[key]['spirate'][1] + "px'";
        	tab_uncat_html+=   "<a id=gal-" +  key +" class='gal' onmousedown='gal_img_click(this.id, event)' oncontextmenu='return false;' ><img" + background_str  + "></a>";
        }
	}
    $("#tab-uncategorised").html(tab_uncat_html);

}

function gal_popup_close()
{
    $("#popup-select_cat").removeClass('show');
	$('a.gal').removeClass('selected');
}

function change_category(id)
{

	PROBE_DATA_CHANGED = true;
	var current_type = $('.nav-tabs .active').text().toLowerCase();
	var updated_type = $("#" + id).text().toLowerCase()
	var probe_id = $('.prb.selected')[0].id.replace('prb-', '');

	var tab_id = "tab-" + updated_type;
	tab_html = ""
	$.each($('.gal.selected '), function() {
		var gal_id = this.id.replace('gal-','');
		if(current_type != "uncategorised")
		{
	 		var ind_id = PROBE_DATA[probe_id][current_type].indexOf(parseInt(gal_id));
	 		PROBE_DATA[probe_id][current_type].splice(ind_id, 1);
 		}
		if(updated_type != "uncategorised")
		{
 			PROBE_DATA[probe_id][updated_type].unshift(parseInt(gal_id));
		}
	});
	set_gallery_for_probe(probe_id);
	gal_popup_close();
}

