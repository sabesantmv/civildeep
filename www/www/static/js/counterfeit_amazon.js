Dropzone.autoDiscover = false;
const IMAGE_BASE_URL = 'https://trademark.vision/lm/tmimage_trim96/'; //AU/1574515
const DEFAULT_TMV_URL = 'http://trademark.vision'
const DEFAULT_IMAGE_DATA = {"search_id":"",
                          "image_id":"",
                          "image_url":"",
                          "segments": [{"top": 0.0, "left": 0.0, "width": 1.0, "height": 1.0}],
                          "authentic_segments":[{"top": 0.0, "left": 0.0, "width": 1.0, "height": 1.0}],
                          "image_h" :"",
                          "image_w":"",
                          "suggested_brand": "",
                          "tmv_segments" : [],
                        };
var CURRENT_IMAGE_DATA = DEFAULT_IMAGE_DATA;
var DROP_ZONE = "";
var ALL_BRANDS = [];
const max_auto_completion_results = 20;
$(document).ready(function() {
    //event delegation for the input boxes
    set_input_for_brands();
    load_demo_images();
});

var LOGO_SEER_AJAX = ""
var COMPARE_LOGOS_AJAX = "";
LOGOSEER_BOXES ={};

//update elements
function update_input_elements(){

    $(".input-text").each(function(){
        var $input = $(this);

        // When get focussed
        $input.focus(function () {
            $input.removeClass("filled");
            if ($input.val() == $input[0].title) {
                $input.val("");
                $input.removeClass("defaultTextActive");
            }
        });
        // on blur and there is nothing set
        $input.blur(function () {
            // add_suggested_brand($input.val());
        });
        $input.blur();
    });
}


$(function() {
    DROP_ZONE = new Dropzone("#tmv-dropzone", {
            dictDefaultMessage : 'Drop/upload an image'
        });
    DROP_ZONE.on("addedfile", function(file) {
        DROP_ZONE.removeEventListeners();
        $(".beforeupload").css({'display': "none"});
        $("#search_img").css({'display': "none"});
        $("#search_img").html("");
        $(".afterupload").css({'display': "inline-block"});
        $("#img_loading").css({'display': "table-cell"});

    });

    DROP_ZONE.on("complete", function(data) {
        $("#demo-imgs").css({"display": "none"});
        DROP_ZONE.removeAllFiles(true);
        var json_data = jQuery.parseJSON(data.xhr.response);
        var image_url = json_data.image_url;
        // CURRENT_IMAGE_DATA.image_url = image_url;
        set_labels_for_image(image_url);
        // set_ocr_and_brand();
    });
});

function set_ocr_and_brand()
{
    $("#detected_ocr").html("");
    CURRENT_IMAGE_DATA.suggested_brand = "";
    CURRENT_IMAGE_DATA.ocr = "";
    add_suggested_brand("");
    var segment_url = "/demo/segment_image/";
    var server_url = DEFAULT_TMV_URL; 
    var ocr_ajax =  $.post(segment_url, JSON.stringify({'image_url': CURRENT_IMAGE_DATA.image_url, "server_url": server_url}),  function(data, status) {
        if(status=="success") {
             var seg_data =  JSON.parse(data);
             CURRENT_IMAGE_DATA.tmv_segments = seg_data.segments;
             if(seg_data.success == true)
             {
                CURRENT_IMAGE_DATA.image_id = seg_data.image_id;
                CURRENT_IMAGE_DATA.image_h = seg_data.image_h;
                CURRENT_IMAGE_DATA.image_w = seg_data.image_w;
                CURRENT_IMAGE_DATA.ocr = seg_data.ocr;
                CURRENT_IMAGE_DATA.suggested_brand = seg_data.suggested_brand;
            }
            else
            {
                CURRENT_IMAGE_DATA.image_id = "";
                var alert_title = "Segmentation Error";
                var alert_disc = seg_data.status + "Full image size applied.";
                var confirm_but_data = "info";
                show_popup_alert(alert_title, alert_disc, confirm_but_data);

            }
     }
    });
    $.when(ocr_ajax).done(function (data) {
        $("#detected_ocr").html(CURRENT_IMAGE_DATA.ocr);
        if(CURRENT_IMAGE_DATA.suggested_brand !== "")
        {
            add_suggested_brand(CURRENT_IMAGE_DATA.suggested_brand);
        }
        // show_results();
    });
}

function get_tmv_segments()
{
    var segment_url = "/demo/segment_image/";
    var server_url = DEFAULT_TMV_URL; 
     return $.post(segment_url, JSON.stringify({'image_url': CURRENT_IMAGE_DATA.image_url, "server_url": server_url}),  function(data, status) {
        if(status=="success") {
             var seg_data =  JSON.parse(data);

             CURRENT_IMAGE_DATA.segments = seg_data.segments;
             CURRENT_IMAGE_DATA.tmv_segments = seg_data.segments;
             if(seg_data.success == true)
             {
                CURRENT_IMAGE_DATA.image_id = seg_data.image_id;
                CURRENT_IMAGE_DATA.image_h = seg_data.image_h;
                CURRENT_IMAGE_DATA.image_w = seg_data.image_w;
                CURRENT_IMAGE_DATA.ocr = seg_data.ocr;
                CURRENT_IMAGE_DATA.suggested_brand = seg_data.suggested_brand;
            }
            else
            {
                CURRENT_IMAGE_DATA.image_id = "";
                var alert_title = "Segmentation Error";
                var alert_disc = seg_data.status + "Full image size applied.";
                var confirm_but_data = "info";
                show_popup_alert(alert_title, alert_disc, confirm_but_data);

            }
     }
    });
}
function click_demo_image(image_url) {
    set_labels_for_image(image_url)
    // set_ocr_and_brand();
}


function apply_homography_controls()
{
    
    // makeTransformable('.box', function (element, H) {
    //     var i, j;
    //     console.log($(element).css('transform'));
    //     return $(element).html($('<table>').append($('<tr>').html($('<td>').text('matrix3d('))).append((function () {
    //         var k, results;
    //         results = [];
    //         for (i = k = 0; k < 4; i = ++k) {
    //             results.push($('<tr>').append((function () {
    //                 var l, results1;
    //                 results1 = [];
    //                 for (j = l = 0; l < 4; j = ++l) {
    //                     results1.push($('<td>').text(H[j][i] + ((i === j && j === 3) ? '' : ',')));
    //                 }
    //                 return results1;
    //             })()));
    //         }
    //         return results;
    //     })()).append($('<tr>').html($('<td>').text(')'))));
    // });
}
function show_results(){
    var segment_url = "/demo/counterfeit_amazon/get_logoseer/";
    $("#detected_logos-loading").css({"display": "inline-block"});
    $("#brand_logos-loading").css({"display": "inline-block"});
    $("#detected_logos").css({"display": "none" });
    $("#brand_logos").css({"display": "none" });
    var server_url = DEFAULT_TMV_URL; 
    if(LOGO_SEER_AJAX != ""){
        LOGO_SEER_AJAX.abort();
    }

    if(COMPARE_LOGOS_AJAX != ""){
        COMPARE_LOGOS_AJAX.abort();
    }
    LOGO_SEER_AJAX = $.post(segment_url, JSON.stringify({'image_url': CURRENT_IMAGE_DATA.image_url, "brand": CURRENT_IMAGE_DATA.suggested_brand}),  function(data, status) {
        if(status=="success") {
            //Set detected logos
            var json_data = JSON.parse(data);
            var logoseer_res = json_data.logoseer;
            $("#detected_logos").css({"display": "flex" });
            $("#detected_logos-loading").css({"display": "none"});
            $("#detected_logos").html("");

            var h = logoseer_res.height;
            var w = logoseer_res.width;
            for(var i in logoseer_res.matches){
                var a_img  = $("<a id='detected-logos-"+ i +"'></a>").appendTo("#detected_logos");
                var image_url = STATIC_URL + logoseer_res.matches[i].image.url;
                var image_icon = $('<img class="lazy">').appendTo(a_img);
                image_icon.attr('data-original', image_url);

                //set image bboxs 
                LOGOSEER_BOXES[image_url]= [{"left" : logoseer_res.matches[i].box.left/w,
                                            "top" : logoseer_res.matches[i].box.top/h,
                                            "width": (logoseer_res.matches[i].box.right - logoseer_res.matches[i].box.left +1 )/w,
                                            "height": (logoseer_res.matches[i].box.bottom - logoseer_res.matches[i].box.top +1 )/h
                                            }]
                // image_icon.attr('data-bbox', bbox);
                a_img.click(function(){
                    var image_url  = $(this).find('img').attr('src');
                    var segments = LOGOSEER_BOXES[image_url];
                    // var segments = $(this).find('img').attr('data-bbox');
                        set_orig_image(image_url, this.id, segments);
                });
            }                
            $("img.lazy").lazyload({
                container : $("#detected_logos")
            });

            //Set brand logos
            $("#brand_logos").css({"display": "flex" });
            $("#brand_logos-loading").css({"display": "none"});
            $("#brand_logos").html("");
            var image_urls = json_data.brand_logos;
            for(var i in image_urls){
                var a_img  = $("<a id='brand_logos-"+ i +"'></a>").appendTo("#brand_logos");
                var image_url = STATIC_URL + image_urls[i];
                var image_icon = $('<img class="lazy">').appendTo(a_img);
                image_icon.attr('data-original', image_url);
                image_icon.attr('data-index', i);

                a_img.click(function(){
                    var image_url  = $(this).find('img').attr('src');
                    var segments = [{"top": 0.0, "left": 0.0, "width": 1.0, "height": 1.0}]
                    set_orig_image(image_url, this.id, segments);
                });

            }                
            $("img.lazy").lazyload({
                container : $("#brand_logos")
            });


        }
     });
}

function set_orig_image(image_url, id, segments_for_search){
    $("#selected-img-wrapper").css({"display" :"inline-block"});
    $("#selected_img").css({"display":"inline-block"});
    $(".image-selector").find("a.selected").removeClass("selected");
    $("#" + id).addClass("selected");

    //add selected_img
    var annotator_id = "selected_img";
    var segments = [{"top": 0.0, "left": 0.0, "width": 1.0, "height": 1.0}]
    $("#" + annotator_id).html("");
    $("#selected_img-loading").css({"display": "none"});
    set_annotation(annotator_id, image_url, segments);

    //reannotate search_img;
    var annotator_id = "search_img";
    $("#" + annotator_id).html("");
    CURRENT_IMAGE_DATA.segments = segments_for_search;
    
    set_annotation(annotator_id, CURRENT_IMAGE_DATA.image_url, segments_for_search);
    $("#compare_but").addClass("active");
}


// function compare_images_overaly()
// {
//     if(COMPARE_LOGOS_AJAX != ""){
//         COMPARE_LOGOS_AJAX.abort();
//     }
//     $("#img-overlay").html("");

//     var authentic_image_url  = $("#selected_img").find('img').attr('src');
//     var search_image_url = CURRENT_IMAGE_DATA.image_url;
//     var box = CURRENT_IMAGE_DATA.segments;
    
//     var compare_url = "/demo/counterfeit_amazon/compare_images/";
//     COMPARE_LOGOS_AJAX =  $.post(compare_url, JSON.stringify({'search_image_url': search_image_url,
//                                                 'authentic_image_url': authentic_image_url,
//                                                 'query_bbox': CURRENT_IMAGE_DATA.segments[0],
//                                                 'ref_bbox': CURRENT_IMAGE_DATA.authentic_segments[0],
//                                             }),  function(data, status) {
//         if(status=="success") {
//             var image_url = STATIC_URL + JSON.parse(data).image_url;
//             var img_icon = $('<img>').appendTo($("#img-overlay"));
//             img_icon.attr('src', image_url);
//             apply_homography_controls();
//         }
//     });

// }


function  add_img_to_overlay(div_id, bbox, is_transformable)
{
    var img_url  = $("#" + div_id).find('img').attr('src');
    var img = $("#" + div_id).find('img')
    var img_crop = {"left" : img.width() * bbox.left,
                        "width": img.width() * bbox.width,
                        "height": img.height() * bbox.height,
                        "top": img.height() * bbox.top};

    var r = Math.min(overlay_width/img_crop.width, overlay_height/img_crop.height)

    var width = img_crop.width *r;
    var height = img_crop.height *r;
    var top = (overlay_height - height)/2;
    var left = (overlay_width - width)/2;

    var box_left = img_crop.left*r;
    var box_top = img_crop.top*r;
    var div_class = "";
    var div_opacity = 1.0;
    if(is_transformable)
    {
        div_class = "box";
        div_opacity = 0.6;
    }
    var element  = $("<div class='drag " + div_class +"'></div>").appendTo($("#img-overlay")).css({
        "position": "absolute",
        "top" : 0 + "px", "left": 0 +"px", "width": width +"px", "height": height + "px",
        "font-family": "monospace",
        "font-size": "small",
        "overflow": "visible",
        "background": "url(" + img_url +")",
        "background-size" : img.width()*r +"px " + img.height()*r +"px",
        "background-position" : -box_left +"px " + -box_top +"px ",
        "opacity": div_opacity,
    });
}

function add_overlay_images(){
    
}

function compare_images()
{
    $("#img-overlay").html("\
                    <div class='loading' style='width:400px; height:400px'><i class='fa fa-circle-o-notch fa-spin'></i><br>Loading ...</div>");
    $(".ui-draggable").remove();
    overlay_width = 400;
    overlay_height = 400;
    var query_box = CURRENT_IMAGE_DATA.segments[0];
    var ref_box = CURRENT_IMAGE_DATA.authentic_segments[0];

    if(COMPARE_LOGOS_AJAX != ""){
        COMPARE_LOGOS_AJAX.abort();
    }

    var ref_image_url  = $("#selected_img").find('img').attr('src');
    var query_image_url = CURRENT_IMAGE_DATA.image_url;
    var query_bbox = CURRENT_IMAGE_DATA.segments[0];
    var ref_bbox = CURRENT_IMAGE_DATA.authentic_segments[0];
    
    var compare_url = "/demo/counterfeit_amazon/compare_images/";
    COMPARE_LOGOS_AJAX =  $.post(compare_url, JSON.stringify({'query_image_url': query_image_url,
                                                'ref_image_url': ref_image_url,
                                                'query_bbox': query_bbox,
                                                'ref_bbox': ref_bbox,
                                            }),  function(data, status)
    {
        $("#img-overlay").html("");
        add_img_to_overlay("selected_img", ref_box, false);
        add_img_to_overlay("search_img", query_box, true);
        // add_overlay_images();
        if(status=="success") {
            var warp =  JSON.parse(data);
            if (warp != undefined){
                console.log(warp);
                makeTransformable('.box');
                init_transform(warp.h_matrix);
                var org_pos, lt, rt, rb, lb;
                $(".box").draggable(
                    {
                    start: function(){
                        org_pos = $(this).offset();
                        lt = $("#handle-left_top").offset();
                        rt = $("#handle-right_top").offset();
                        rb = $("#handle-right_bottom").offset();
                        lb = $("#handle-left_bottom").offset();
                    },
                    drag: function(){
                        var x_move = $(this).offset().left - org_pos.left;
                        var y_move = $(this).offset().top - org_pos.top;
                        console.log(x_move);
                        console.log(y_move);
                        $("#handle-left_top").css({"left" : lt.left + x_move , "top": lt.top + y_move});
                        $("#handle-right_top").css({"left" : rt.left + x_move, "top": rt.top + y_move});
                        $("#handle-right_bottom").css({"left" : rb.left + x_move, "top": rb.top + y_move});
                        $("#handle-left_bottom").css({"left" : lb.left + x_move, "top": lb.top + y_move});
                    }
                });
            }
        }
    });

}

function init_transform(h){
    H = [[h[0][0], h[0][1], 0, h[0][2]], [h[1][0], h[1][1], 0, h[1][2]], [0, 0, 1, 0], [h[2][0], h[2][1], 0, 1]];

    var k, transpose_h;
    transpose_h = [];
    for (i = k = 0; k < 4; i = ++k) {
        transpose_h.push((function () {
            var l, results1;
            results1 = [];
            for (j = l = 0; l < 4; j = ++l) {
                results1.push(H[j][i].toFixed(20));
            }
            return results1;
        })());
    }
 
    init_points(H);
    $(".box").css({
        'transform': `matrix3d(${((function () {
            return transpose_h;
        })()).join(',')})`,
        'transform-origin': '0 0'
    });
}

function init_points(H)
{
    function apply_2dtransform(tx, pt, ref_pt){
        console.assert(pt.length == 2 && ref_pt.length ==2);
        //shift the pt to the ref_pt
        pt = numeric.sub(pt, org);
        // do the transform
        pt = numeric.dot(tx, pt.concat(0,1));
        //do the scaling
        pt = numeric.div(pt, pt[3]);
        //add to the ref_pt
        pt = numeric.add(pt, ref_pt)
        return pt.slice(0,2)
    }
    var refs = ['left_top', 'right_top', 'right_bottom', 'left_bottom'];
    var org = [$("#handle-left_top").offset().left, $("#handle-left_top").offset().top]
    for(var i in refs)
    {
        pt = [$("#handle-" + refs[i]).offset().left, $("#handle-" + refs[i]).offset().top];
        pt = apply_2dtransform(H, pt, org);
        $("#handle-" + refs[i]).css({"left" : pt[0], "top": pt[1]});
    } 
}

function load_demo_images() {
    $('#demo-imgs').html("");
    var probe_url = '/demo/counterfeit_amazon/load_demo_images/';
    AJAX_LOAD_DEMO_IMAGES = $.get(probe_url,  function(data, status) {
        if(status=="success") {
            var image_paths = JSON.parse(data); 
            for(var i in image_paths){
                var image_url  =  STATIC_URL +  image_paths[i];
                var img_title = image_url.replace(/\.[^/.]+$/, "");
                img_title = img_title.substr(img_title.lastIndexOf('/')+1);
                var a_img  = $("<a id='img-" + img_title + "'></a>").appendTo("#demo-imgs");
                var img_icon = $("<img title='"+ img_title +"' class='demo-imgthumb lazy' >").appendTo(a_img);
                img_icon.attr('data-original', image_url);
                a_img.click(function(){
                    var image_url  = $(this).find('img').attr('data-original');
                    click_demo_image(image_url);
                });
            }
            $("img.lazy").lazyload({
                container : $("#demo-imgs"),
                threshold : 500
            });
            $("#demo-imgs").trigger('scroll');

        }
    });
}

function enable_submit() {
    $(".dz-hidden-input").attr("disabled", false);
}

function set_labels_for_image(image_url) {
    prb_popup_close();
    CURRENT_IMAGE_DATA.image_url = image_url;
    $("#search_img").html("");
    
    $("#demo-imgs").css({'display': "none"});
    $(".beforeupload").css({'display': "none"});
    $("#search-img-wrapper").css({'display': "inline-block"});
    update_input_elements();
    $("#img_loading").css({'display': "none"});
    $(".dz-hidden-input").attr("disabled", true);
    $(".dz-hidden-input").css({"cursor" : "default"});
    $("#search_img").css({'display': "block"});
    $("#selected-img-wrapper").css({"display" :"inline-block"});
    var annotator_id = "search_img";
    set_annotation(annotator_id, CURRENT_IMAGE_DATA.image_url, CURRENT_IMAGE_DATA.segments);
    $("#image_options").css({"visibility": "visible"});
    $("#response").css({"display" : "inline-block"});
    $("#output").css({"display" : "inline-block"});
}


function set_annotation(annotator_id, image_url, segments)
{
    var annotator = new BBoxAnnotator({
        url: image_url,
        id: "#" + annotator_id,
        image_label : annotator_id,
        entries: segments,
        width:300,
        height:300,
        border_width : 2,
        input_method: 'text',    // Can be one of ['text', 'select', 'fixed']
        labels: [],//[{"label": "fdfdfd", "value":"fdfd", "thumb_url":""}],
        editable : true,
        show_info: false,
        onchange: function(entries) {
            if($(this)[0].options.image_label == "selected_img")
                CURRENT_IMAGE_DATA.authentic_segments = entries;
            else
                CURRENT_IMAGE_DATA.segments = entries;
        }
    });
}

function wrapper_options_clicked(){
    $(".beforeupload").css({'display': "none"});
    $("#search_img").css({'display': "none"});
    $("#search_img").html("");
    $("#search-img-wrapper").css({'display': "inline-block"});
    $("#img_loading").css({'display': "table-cell"});

}
function tmv_seg(){
    wrapper_options_clicked()
    if(CURRENT_IMAGE_DATA.tmv_segments != "")
    {
     CURRENT_IMAGE_DATA.segments = CURRENT_IMAGE_DATA.tmv_segments;
        set_labels_for_image();
    }
    else{
        segment_ajax = get_tmv_segments();
        $.when(segment_ajax).done(function (data) {
            set_labels_for_image();
        });
    }
}

function clear_seg(){
    wrapper_options_clicked()
    CURRENT_IMAGE_DATA.segments =[];
    set_labels_for_image();
}

function full_seg(){
    wrapper_options_clicked()
    CURRENT_IMAGE_DATA.segments =[{"top": 0.0, "left": 0.0, "width": 1.0, "height": 1.0}]
    set_labels_for_image();
}

function set_input_for_brands(){
    // var keyword_input = $("#keyword");
    var url = "/demo/counterfeit_amazon/get_all_brands/";
    var brand_input  = document.getElementById("select_brand");
    $.get(url, function(data, status) {
        if(status=="success") {
            ALL_BRANDS = JSON.parse(data);
            update_input_elements();
            new Awesomplete(brand_input, {
                autoFirst: false,
                list: ALL_BRANDS,
                maxItems: 300,
                sort: false,
                // replace: function (text) {
                //     this.input.value = text;
                // },
                item: function (label, input) {
                   var html = "<div class='li-row'>\
                                    <div class='keyword_label'>" + label + "\
                                    </div>\
                                </div>"
                    return Awesomplete.$.create("li", {
                        innerHTML: html,
                        "aria-selected": "false"
                    });
                },
            });
        }
    });
    Awesomplete.$.bind(brand_input, { "awesomplete-select":function(event)
    {
        add_suggested_brand(event.text.value)
        
    }});
}

function add_suggested_brand(text)
{
    var $input =  $("#select_brand");
    var selected_ind = ALL_BRANDS.findIndex(item => text.toLowerCase() === item.toLowerCase());
    if(selected_ind >= 0 )
    {
        $input.val(CURRENT_IMAGE_DATA.suggested_brand);
        $input.addClass('filled');
        $input.removeClass("defaultTextActive");
        CURRENT_IMAGE_DATA.suggested_brand = ALL_BRANDS[selected_ind];
        show_results();
    
    }
    else
    {
        $input.addClass("defaultTextActive");
        $input.removeClass('filled');
        $input.val($input[0].title);
        CURRENT_IMAGE_DATA.suggested_brand = "";
    }
}


function prb_popup_close() {
    if(LOGO_SEER_AJAX != ""){
        LOGO_SEER_AJAX.abort();
    }

    if(COMPARE_LOGOS_AJAX != ""){
        COMPARE_LOGOS_AJAX.abort();
    }

    CURRENT_IMAGE_DATA = {"search_id":"",
                          "image_id":"",
                          "image_url":"",
                          "segments": [{"top": 0.0, "left": 0.0, "width": 1.0, "height": 1.0}],
                          "image_h" :"",
                          "image_w":"",
                          "suggested_brand": "",
                          "tmv_segments" : [],
                          "authentic_segments":[{"top": 0.0, "left": 0.0, "width": 1.0, "height": 1.0}],
                        };
    $("#image_loaded").css({"display":"none"});
    $("#search-img-wrapper").css({'display': "none"});

  


    $("#image_options").css({"visibility": "hidden"});

    $("#demo-imgs").css({'display': "inline-block"});
    $(".beforeupload").css({'display': "inline-block"});
    $(".dz-hidden-input").css({"cursor" : "pointer"})
    if(typeof(DROP_ZONE) == "object")
        DROP_ZONE.setupEventListeners();
    
    //selected image
    $("#selected-img-wrapper").css({'display': "none"});
    $("#selected_img").html("");
    $("#selected_img").css({"display":"none"});
    $("#selected_img-loading").css({"display": "table-cell"});
    LOGOSEER_BOXES ={};

    //response
    $("#response").css({"display" : "none"});
    $("#brand_logos").html("Select brand to display");
    //detected logos
    $("#detected_logos").html("Select brand to display");
    $("#detected_logos").css({"display": "block"})
    $("#detected_logos-loading").css({"display": "none"})
    
    //brand logos
    $("#brand_logos").html("Select brand to display");
    $("#brand_logos").css({"display": "block"})
    $("#brand_logos-loading").css({"display": "none"})
    // ouput
    $("#output").css({"display" : "none"});
    $("#img-overlay").html("Select Images to Compare.");
    $(".ui-draggable").remove();
    
    // ocr and brands                    
    $("#detected_ocr").html("");
    add_suggested_brand("");

    // $("#probe_desc").removeClass("filled");
    // $("#probe_desc").val("");
    // $("#suggested_keywords_container").html("");
    // $("#keyword").addClass("defaultTextActive");
    // $("#keyword").val($("#keyword")[0].title);

    // $("#btn-delete").html("delete probe");
    // $("#btn-update").html("update probe");
}




