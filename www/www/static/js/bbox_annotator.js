var NUM_VIS_PAGES = 5;
var RESULTS_PER_PAGE  =5;
var IMG_SERVER_URL = ""; // /static/instacart/devkit/instacart_v1/";
var PAGE_DATA = {};

var CLASS_LABELS = []

function getParameterByName(name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

$(document).ready(function() {

  var ajax_labels =  get_devkit_data();
  var ajax_annotation_data =  get_annotation_data(0);

  $.when(ajax_labels, ajax_annotation_data).done(function(devkit_data, annotation_data)
	{
    var dev_data = JSON.parse(devkit_data[0]);
    IMG_SERVER_URL = dev_data['devkit_static_path'] 
    var labels = dev_data['labels']
    var annotation_data = JSON.parse(annotation_data[0]);
    CLASS_LABELS = []
    for(var i in labels){
      var img_thumb_url  = "";
      if(labels[i].thumb_url !== "")
        img_thumb_url = IMG_SERVER_URL + labels[i].thumb_url
      CLASS_LABELS.push({'label': labels[i].tag,
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
      var filename = PAGE_DATA[i]['filename'];
      var image_url = IMG_SERVER_URL + "/annotations/images/" + filename;
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
        labels: CLASS_LABELS,
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

function get_devkit_data()
{
    var url = "/demo/object_detection/get_devkit_data/";
    return $.get(url, function(data, status){
    });
}

function get_annotation_data(page){
    var url = "/demo/object_detection/get_annotation_data/";
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


// Annotator functions forked from ###

(function() {
  var BBoxSelector;
  BBoxSelector = (function() {
    function BBoxSelector(image_frame, options) {
      if (options == null) {
        options = {};
      }
      options.input_method || (options.input_method = "text");
      this.image_frame = image_frame;
      this.border_width = options.border_width || 2;
      this.selector = $('<div class="bbox_selector"></div>');
      this.selector.css({
        "border": this.border_width + "px dotted rgb(127,255,127)",
        "position": "absolute"
      });
      this.image_frame.append(this.selector);
      this.selector.css({
        "border-width": this.border_width
      });
      this.selector.hide();
      this.create_label_box(options);
    }

    BBoxSelector.prototype.create_label_box = function(options) {
      var i, label, len, ref;
      options.labels || (options.labels = ["object"]);
      this.label_box = $('<div class="label_box"></div>');
      this.label_box.css({
        "position": "absolute"
      });
      this.image_frame.append(this.label_box);
      switch (options.input_method) {
        case 'select':
          if (typeof options.labels === "string") {
            options.labels = [options.labels];
          }
          this.label_input.change(function(e) {
            return this.blur();
          });
          break;
        case 'text':
          if (typeof options.labels === "string") {
            options.labels = [options.labels];
          }
          var label_input = $('<input class="label_input" name="label" ' + 'type="text" value>').appendTo(this.label_box);
          var image_icon = $('<img class="auto-complete-img-thumb" name="img_thumb">').appendTo(this.label_box);
          image_icon.attr('src', "");
          this.label_input = label_input;
          this.label_input.css({"z-index": 100});
          var validOptions = options.labels;
          this.label_input.autocomplete({
            source: validOptions || [''],
            // autoFocus: true,
            minLength: 0,
            focus: function( event, ui ) {
              // label_input.val(ui.item.label);
                image_icon.attr('src', '');
                image_icon.hide();
                if(ui.item.thumb_url !=='')
                {
                  image_icon.attr('src', ui.item.thumb_url);
                  var menu = $(this).data("uiAutocomplete").menu.element;
                  var focused = menu.find("li:has(a.ui-state-focus)");
                  var left = focused.width();
                  var top = label_input.height() + focused.offset().top  - focused.parent().offset().top;
                  image_icon.css({'top': top, 'left': left});
                  image_icon.show();
                  image_icon.error(function() {
                    console.log("error");
                    image_icon.hide();
                  });
                }
                else{image_icon.hide();}

                // image_icon.css({"visibility": "visible"});
                // image_icon.onerror = function () {
                //   image_icon.css({"visibility": "hidden"});
                // };
              return false;
            },
            select: function( event, ui ) {
              label_input.val(ui.item.label)
              image_icon.attr('src', "");
              image_icon.hide();
              // $( "#project" ).val( ui.item.label );
              // $( "#project-id" ).val( ui.item.value );
              // $( "#project-description" ).html( ui.item.desc );
              // $( "#project-icon" ).attr( "src", "images/" + ui.item.icon );
                return false;
            }
          })
          .keyup(function() {
            var isValid = false;
            for (i in validOptions) {
                if (validOptions[i]['label'].toLowerCase().match(this.value.toLowerCase())) {
                    isValid = true;
                }
            }
            if (!isValid) {
                this.value = previousValue
            } else {
                previousValue = this.value;
            }
          })
          // .data( "ui-autocomplete" )._renderItem = function( ul, item ) {
          //     return $( "<li></li>" ).data("item.autocomplete", item)
          //     .append( "<a>" + item.label + "</a>")
          //   .appendTo( ul );
          // };

          break;
        case 'fixed':
          if ($.isArray(options.labels)) {
            options.labels = options.labels[0];
          }
          this.label_input = $('<input class="label_input" name="label" type="text">');
          this.label_box.append(this.label_input);
          this.label_input.val(options.labels);
          break;
        default:
          throw 'Invalid label_input parameter: ' + options.input_method;
      }
      return this.label_box.hide();
    };

    BBoxSelector.prototype.crop = function(pageX, pageY) {
      var point;
      return point = {
        x: Math.min(Math.max(Math.round(pageX - this.image_frame.offset().left), 0), Math.round(this.image_frame.width() - 1)),
        y: Math.min(Math.max(Math.round(pageY - this.image_frame.offset().top), 0), Math.round(this.image_frame.height() - 1))
      };
    };

    BBoxSelector.prototype.start = function(pageX, pageY) {
      this.pointer = this.crop(pageX, pageY);
      this.offset = this.pointer;
      this.refresh();
      this.selector.show();
      // $('body').css('cursor', 'crosshair');
      return document.onselectstart = function() {
        return false;
      };
    };

    BBoxSelector.prototype.adjust_start = function(options, selected_entry, pageX, pageY) {
      var moving_point, fixed_point, point1, point2, input_val;
      var index = options.labels.findIndex(x => x.value==selected_entry.label);
      if( index >=0)
        input_label = options.labels[index]['label'];
      else
        input_label  = '';
      this.label_input.val(input_label);
      moving_point = this.crop(pageX, pageY);
      var left = Math.round(selected_entry.left * options.image_width)
      var top = Math.round(selected_entry.top * options.image_height)
      var width = Math.round(selected_entry.width * options.image_width)
      var height = Math.round(selected_entry.height * options.image_height)
      point1 = {x: left, y: top}
      point2 = {x: left + width , y: top + height}

      var dist_point1 = Math.pow(point1.x - moving_point.x, 2) + Math.pow(point1.y - moving_point.y, 2);
      var dist_point2 = Math.pow(point2.x - moving_point.x, 2) + Math.pow(point2.y - moving_point.y, 2);
      if(dist_point1 <= dist_point2)
        fixed_point = point2;
      else
        fixed_point = point1;

      this.pointer = moving_point;
      this.offset = fixed_point;
      this.refresh();
      this.selector.show();
      // $('body').css('cursor', 'crosshair');
      return document.onselectstart = function() {
        return false;
      };
    };

    BBoxSelector.prototype.update_rectangle = function(pageX, pageY) {
      this.pointer = this.crop(pageX, pageY);
      return this.refresh();
    };

    BBoxSelector.prototype.input_label = function(options) {
      $('body').css('cursor', 'default');
      document.onselectstart = function() {
        return true;
      };
      this.label_box.show();
      return this.label_input.focus();
    };

    BBoxSelector.prototype.finish = function(options) {
      var data;
      this.label_box.hide();
      this.selector.hide();
      data = this.rectangle();
      data.left /= options.image_width;
      data.width /= options.image_width;
      data.top /= options.image_height;
      data.height /= options.image_height;
      if (options.input_method !== 'fixed') {
        this.label_input.val('');
      }
      return data;
    };

    BBoxSelector.prototype.rectangle = function() {
      var rect, x1, x2, y1, y2;
      x1 = Math.min(this.offset.x, this.pointer.x);
      y1 = Math.min(this.offset.y, this.pointer.y);
      x2 = Math.max(this.offset.x, this.pointer.x);
      y2 = Math.max(this.offset.y, this.pointer.y);
      return rect = {
        left: x1,
        top: y1,
        width: x2 - x1 + 1,
        height: y2 - y1 + 1
      };
    };

    BBoxSelector.prototype.refresh = function() {
      var rect;
      rect = this.rectangle();
      this.selector.css({
        left: (rect.left - this.border_width) + 'px',
        top: (rect.top - this.border_width) + 'px',
        width: rect.width + 'px',
        height: rect.height + 'px'
      });
      return this.label_box.css({
        left: (rect.left - this.border_width) + 'px',
        top: (rect.top + rect.height + this.border_width) + 'px'
      });
    };

    BBoxSelector.prototype.get_input_element = function() {
      return this.label_input;
    };

    return BBoxSelector;

  })();


  var $window = this; // set the window
  this.BBoxAnnotator = (function() {
    function BBoxAnnotator(options) {
      var annotator, image_element;
      annotator = this;
      this.annotator_element = $(options.id || "#bbox_annotator");
      options.image_label = options.image_label || "bbox_annotator";
      this.border_width = options.border_width || 2;
      options.entries  = options.entries || [];
      if(options.editable == undefined)
        options.editable = true;

      this.show_label = options.show_label || (options.input_method !== "fixed");
      this.image_frame = $("<div class='image_frame'><img class='div_img' src=></div>");
      this.annotator_element.append(this.image_frame);
      this.options = options;

      if(options.height && options.width)
      {
        annotator.annotator_element.css({
        "width": (options.width + annotator.border_width * 2) + 'px',
        "height": (options.height + annotator.border_width * 2) + 'px',
        //"position": "relative",
        });
      }
      var loading_element = $("<div class='loading'><i class='fa fa-circle-o-notch fa-spin'></i><br>Loading results...</div>").appendTo(this.annotator_element)
      image_element = new Image();
      image_element.src = options.url;
      image_element.title = options.url;
      image_element.onload = function()
      {
        loading_element.remove();
        if(options.width && options.height){
          r = Math.min(options.width/image_element.width, options.height/image_element.height)
          options.image_width = image_element.width*r;
          options.image_height = image_element.height*r;
          options.margin_top = parseInt((options.height - options.image_height)/2.0);
          options.margin_left = parseInt((options.width - options.image_width)/2.0);
        }
        else{
          options.image_height = image_element.height;
          options.image_width = image_element.width;
          options.width = image_element.width;
          options.height = image_element.height;
          options.margin_top= 0;
          options.margin_left= 0;
        }
        annotator.annotator_element.css({
          "width": (options.width + annotator.border_width * 2) + 'px',
          "height": (options.height + annotator.border_width * 2) + 'px',
          "padding-top": options.margin_top + 'px',
          "padding-left": options.margin_left + 'px',
          "padding-right": options.margin_left + 'px',
          "position": "relative",

        });
        if(annotator.options.editable){
          var annotator_cursor = "crosshair";
        }
        else{
          var annotator_cursor = "default";
        }

        annotator.image_frame.css({
          "width": options.image_width,
          "height": options.image_height,
          "position": "relative",
          "cursor": annotator_cursor
        });
        annotator.display_element =annotator.image_frame.find(".div_img");
        annotator.display_element.css({
          "width": '100%',
          "height": 'auto',
          "max-height": '100%',
        });
        annotator.display_element.attr('src', options.url);

        //initialise the previous entries on the annotator image
        annotator.initialize_entires(options);

        $("<div id='info_popup' class='popup'></div>").appendTo(document.body);
        annotator.info_button = $("<a class=info_popup_open></a>").appendTo(annotator.annotator_element).css({
          "position": "absolute",
          "top": "5px",
          "right": "5px",
          "width": "20px",
          "height": "20px",
          "line-height": "15px",
          "overflow": "hidden",
          "color": "white",
          "background-color": "",
          "border" : "0px",
          "-moz-border-radius": "20px",
          "-webkit-border-radius": "20px",
          "border-radius": "20px",
          "cursor": "pointer",
          "-moz-user-select": "none",
          "-webkit-user-select": "none",
          "text-align": "center",
          "display" : "block"
        });
        $('#info_popup').popup(
        {
          type:	'overlay',
          transition: 'all 0.3s',
          scrolllock: false,
          background:false
        });
        if(annotator.options.editable)
        {
          annotator.selector = new BBoxSelector(annotator.image_frame, options);
          annotator.initialize_events(annotator.selector, options);
        }
        return true;
      };

      image_element.onerror = function() {
        return annotator.annotator_element.text("Invalid image URL: " + options.url);
      };
      this.entries = [];
      this.onchange = options.onchange;
    }
    
    BBoxAnnotator.prototype.initialize_entires = function(options) {
      for(var i in options.entries)
      {
        this.add_entry(options.entries[i]);
      }
      return true;
    }

    BBoxAnnotator.prototype.initialize_events = function(selector, options) {
      var annotator, status;
      status = 'free';
      this.hit_menuitem = false;
      annotator = this;

      annotator.info_button.hover((function(e) {
        annotator.info_button.css({"border": "2px solid #fff", "background": "#337ab7"});
        annotator.info_button.html("i");
        return true;
      }), (function(e) {
        annotator.info_button.css({"border": "", "background": ""});
        annotator.info_button.html("");
        return true;
      }));

      annotator.info_button.mousedown(function(e){
        annotator.status = "";
        annotator.hit_menuitem = true;
        show_info(options.image_label);
      });

      annotator.annotator_element.mousedown(function(e) {
        if (!annotator.hit_menuitem) {
          switch (status) {
            case 'free':
            case 'input':
              if (status === 'input') {
                selector.get_input_element().blur();
              }
              else if (e.which === 1) {
                selector.start(e.pageX, e.pageY);
                status = 'hold';
              }
          }
        }
        if (annotator.status == 'adjust')
        {
          selector.adjust_start(options, annotator.selected_entry, e.pageX, e.pageY);
          annotator.status = "";
          status = 'hold';
        }

        console.log(status);
        annotator.hit_menuitem = false;
        return true;
      });
      $(window).mousemove(function(e) {
        switch (status) {
          case 'hold':
            selector.update_rectangle(e.pageX, e.pageY);
            break;
        }
        return true;
      });
      $(window).mouseup(function(e) {
        switch (status) {
          case 'hold':
            selector.update_rectangle(e.pageX, e.pageY);
            selector.input_label(options);
            status = 'input';
            if (options.input_method === 'fixed') {
              selector.get_input_element().blur();
            }
            break;
          // if status 'adjust':
          //   status = 'free'
          //   annotator.status = 'free'
          //   break;
        }
        return true;
      });

      selector.get_input_element().blur(function(e) {
        var data;
        switch (status) {
          case 'input':
            var input_label = $(this).val();
            var index = options.labels.findIndex(x => x.label==input_label);
            data = selector.finish(options);
            if(index >= 0)
            { data.label = options.labels[index]['value']
              annotator.add_entry(data);
              if (annotator.onchange) {
                annotator.onchange(annotator.options.image_label, annotator.entries);
              }
            }
            status = 'free';
            return true
        }
      });
      selector.get_input_element().keypress(function(e) {
        switch (status) {
          case 'input':
            if (e.which === 13) {
              selector.get_input_element().blur();
            }
        }
        return e.which !== 13;
      });
      selector.get_input_element().mousedown(function(e) {
        return annotator.hit_menuitem = true;
      });
      selector.get_input_element().mousemove(function(e) {
        return annotator.hit_menuitem = true;
      });
      selector.get_input_element().mouseup(function(e) {
        return annotator.hit_menuitem = true;
      });
      return selector.get_input_element().parent().mousedown(function(e) {
        return annotator.hit_menuitem = true;
      });
    };

    BBoxAnnotator.prototype.add_entry = function(entry) {
      var annotator, box_element, close_button, text_box, top_left_drag, bottom_right_drag;
      annotator = this;
      this.entries.push(entry);
      var options = this.options;
      box_element = $('<div class="annotated_bounding_box"></div>');

      box_element.appendTo(this.image_frame).css({
        "border": this.border_width + "px solid rgb(127,255,127)",
        "position": "absolute",
        "top":  Math.round(entry.top * options.image_height)  - options.border_width + "px",
        "left": Math.round(entry.left * options.image_width)  - options.border_width + "px",
        "width": Math.round(entry.width * options.image_width) + "px",
        "height": Math.round(entry.height * options.image_height) + "px",
        "color": "rgb(127,255,127)",
        "font-family": "monospace",
        "font-size": "small"
      });
      //label box 
      text_box = $('<div></div>').appendTo(box_element).css({
        "overflow": "hidden"
      });
      if (this.show_label) {
        text_box.text(entry.label);
      }
      //only editable options are available if required
      if(options.editable)
      {
        close_button = $('<div></div>').appendTo(box_element).html('&#215;').css({
          "position": "absolute",
          "top": "-8px",
          "right": "-8px",
          "width": "16px",
          "height": "16px",
          "line-height": "12px",
          "overflow": "hidden",
          "color": "white",
          "background-color": "#030",
          "border": "2px solid #fff",
          "-moz-border-radius": "16px",
          "-webkit-border-radius": "16px",
          "border-radius": "16px",
          "cursor": "pointer",
          "-moz-user-select": "none",
          "-webkit-user-select": "none",
          "user-select": "none",
          "text-align": "center"
        });

        top_left_drag = $('<div></div>').appendTo(box_element).css({
          "position": "absolute",
          "top": "-4px",
          "left": "-4px",
          "width": "8px",
          "height": "8px",
          "border-radius": "4px",
          "padding": "0 0 0 0",
          "overflow": "hidden",
          "color": "green",
          "background-color": "white",
          "cursor": "pointer",
          "-moz-user-select": "none",
          "-webkit-user-select": "none",
          "user-select": "none",
          "text-align": "center",
          "display": "none",
          "border": "1px solid black"
        });

        bottom_right_drag = $('<div></div>').appendTo(box_element).css({
          "position": "absolute",
          "bottom": "-4px",
          "right": "-4px",
          "width": "8px",
          "height": "8px",
          "padding": "0 0 0 0",
          "overflow": "hidden",
          "border-radius": "4px",
          "color": "green",
          "background-color": "white",
          "cursor": "pointer",
          "-moz-user-select": "none",
          "-webkit-user-select": "none",
          "user-select": "none",
          "text-align": "center",
          "display": "none",
          "border": "1px solid black"
        });

        box_element.hover((function(e) {
          top_left_drag.show();
          bottom_right_drag.show();
          close_button.show();
          return true;
        }), (function(e) {
          top_left_drag.hide();
          bottom_right_drag.hide();
          close_button.hide();
          return true;
        }));
        
        top_left_drag.mousedown(function(e) {
          var index, selected_bbox;
          annotator.status = "adjust";
          annotator.hit_menuitem = true;
          selected_bbox = top_left_drag.parent(".annotated_bounding_box");
          index = selected_bbox.prevAll(".annotated_bounding_box").length;
          annotator.selected_entry = annotator.entries[index]; 
          selected_bbox.detach();
          annotator.entries.splice(index, 1);
        });

        bottom_right_drag.mousedown(function(e) {
          var index, selected_bbox;
          annotator.status = "adjust";
          annotator.hit_menuitem = true;
          selected_bbox = bottom_right_drag.parent(".annotated_bounding_box");
          index = selected_bbox.prevAll(".annotated_bounding_box").length;
          annotator.selected_entry = annotator.entries[index]; 
          selected_bbox.detach();
          annotator.entries.splice(index, 1);
        });

        close_button.mousedown(function(e) {
          return annotator.hit_menuitem = true;
        });

        close_button.click(function(e) {
          var clicked_box, index;
          clicked_box = close_button.parent(".annotated_bounding_box");
          index = clicked_box.prevAll(".annotated_bounding_box").length;
          clicked_box.detach();
          annotator.entries.splice(index, 1);
          return annotator.onchange(annotator.options.image_label, annotator.entries);
        });
        close_button.hide();
      }
      else{
        var label_data = options.labels[entry.label];
        var percent = Math.floor(parseFloat(entry.score)*100) + "%";

        var image_icon_html = "<div class='objdet'><div class='image-tile'> <img src='" + label_data.thumb_url + "' alt=''> </div><div class='label-tile'>" + label_data.label + "</div><div class='percent-tile'>" + percent + "</div></div>";

        var image_icon = $(image_icon_html).appendTo(annotator.image_frame);

        // if(label_data.thumb_url !=='')
        // {
          var margin = 5;
          var left = box_element.position().left- (image_icon.width() - box_element.width())/2.0;
          var top = box_element.position().top - image_icon.height() - options.border_width  - margin;
          if(top < 0)
            top = box_element.position().top + box_element.height() + options.border_width + margin;

          image_icon.css({'top': top, 'left': left});
        // }
        box_element.hover((function(e) {
          $(this).css('cursor','pointer'); 
          image_icon.show();
          return true;
        }), (function(e) {
          $(this).css('cursor','auto'); 
          image_icon.hide()
          return true;
        }));
      }
      return true;
    };

    BBoxAnnotator.prototype.clear_all = function(e) {
      this.annotator_element.find(".annotated_bounding_box").detach();
      this.entries.splice(0);
      return this.onchange(this.image_label, this.entries);
    };

    return BBoxAnnotator;

  })();

}).call(this);

