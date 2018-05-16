// loaders to pre-load images
function loadImage(src) {
    var deferred = $.Deferred();
    var sprite = new Image();
    sprite.onload = function() {
        deferred.resolve();
    };
    sprite.src = src;
    return deferred.promise();
}


function get_leafnodes(data)
{
    //it assumes leaf nodes only have 3 elements and other objects should be greater than that
    leaf_data = {};

    function recursive_leaf(data)
    {
        for(var code in data)
        {
            if(typeof data[code] === "object")
            {
                if(Object.keys(data[code]).length ==2)
                    leaf_data[code] = {'detail': data[code]['detail'], 'conf': data[code]['conf']};
                else
                    recursive_leaf(data[code]);
            }
        }
    }
    recursive_leaf(data);
    return leaf_data;
}

function tree_labels(data, list_id, classifier, progress_divs)
{
    tree_level = 0; //not used
    var sorted_data = [];
    for(var code in data){
        if(typeof(data[code]) == 'object')
        {
            var d = data[code];
            d['code'] = code;
            sorted_data.push(d);
        }
    }
    sorted_data.sort(function(a, b) { return b.conf - a.conf});
    for(var idx in sorted_data){
        var code = sorted_data[idx]['code']
        // var abs_code = code.slice(code.search('-') +1);
        // var colour_ind = abs_code.match(/^[+\-0-9(). ]+$/g) !== null ? Math.floor(abs_code.length/3) : 2 
        var colour_map = "";//COLOUR_MAPS[tree_level]; -- not used as all the hierchy sharing the same colour
        var conf = data[code]['conf'];
        var code_disc = data[code]['detail'];
        var code_id = create_id(code);
        var progress_bar_id = "progress-" + list_id + '_' + RES_COUNT + '_' + code_id;
        var list_id_current = "li-" + classifier + '_' + RES_COUNT + '_' + code_id;

        var res_label = ''
        if(code_disc == '')
            var res_label = code
        else
            var res_label = code + ' - ' + code_disc.charAt(0).toUpperCase() + code_disc.substr(1).toLowerCase();
        var percent = Math.floor(parseFloat(conf)*100)
        
        //only show progress bars if the confidence values have any meaning
        var progress_div_html = ""
        if(percent >=0){
            progress_div_html = "<div class='ul-right progress' id=" + progress_bar_id + ">\
                                    <div></div>\
                                    </div>";
            progress_divs.push({'id': '#' + progress_bar_id, 'percent': percent, 'whl-type' : colour_map})
        }

        var per_label_list_html =  "<ul>\
                                <li id=" + list_id_current + ">\
                                <a>\
                                    <div class='ul-left' data-code="+code+">" + res_label + "\
                                    </div>"
                                    +
                                    progress_div_html
                                    +"\
                                </a>\
                                </li>\
                                </ul>";
        // <div class='ul-right-label' id=_c_" + progress_bar_id + ">\
        // </div>\

        $("#" + list_id).append(per_label_list_html);
        if(Object.keys(data[code]).length > 3)
        {
            progress_divs = tree_labels(data[code], list_id_current, classifier, progress_divs, tree_level +1);
        }
    }
    return progress_divs;
}

function apply_tree_view(id)
{

    $(id + ' li' ).each( function() {
            if( $( this ).children( 'ul' ).length > 0 ) {
                    $( this ).addClass( 'parent' );     
            }
    });
    
    $(id + ' li.parent > a' ).click( function( ) {
            $( this ).parent().toggleClass( 'active' );
            $( this ).parent().children('ul').slideToggle( 'fast' );
            $( this ).children('.progress').toggleClass('hide');
    });

}

function apply_progress(progress_divs) {
    for (var obj_id in progress_divs) {

        var $obj = $(progress_divs[obj_id]['id']);
        var percent = progress_divs[obj_id]['percent'];
        // $("#_c_" + progress_divs[obj_id]['id'].replace("#", "")).html(percent + "%  ");
        var $progress_obj = $obj.find('div');
        $progress_obj.animate({'width': percent + '%'}, 500);
        $progress_obj.css('background', 'linear-gradient(to right,' + percentToHSL(0, 'b') + ',' + percentToHSL(percent/2, 'b') + ')');
    }
}

function create_id(input_str)
{
    elem_id = input_str.replace(/\./g, '_');
    elem_id = elem_id.replace(/\+/g, '_');
    elem_id = elem_id.replace(/\,/g, '_');
    elem_id = elem_id.replace(/\:/g, '_');
    elem_id = elem_id.replace(/\ /g, '_');
    elem_id = elem_id.replace(/\(/g, '_');
    elem_id = elem_id.replace(/\)/g, '_');
    elem_id = elem_id.replace(/ /g, '_');
    return elem_id;
}

//set the RGB colours for confidence
function percentToRGB(percent) {

    r = 0;
    b = 0;
    g = Math.floor(255 * (percent / 100));

    return "rgb(" + r + "," + g + "," + b + ")";

}

//set the HSL colours for confidence
function percentToHSL(percent, colour_wheel) {
    var h = 210;
    var s = 100 + "%";
    var l = 90 - (Math.floor((percent / 100 * 70))) + "%";
    if (colour_wheel == 'g') {
        h = 195;
        var l = 50 - (Math.floor((percent / 100 * 40))) + "%";
    }

    hsl_colour = "hsl(" + h + "," + s + "," + l + ")";
    return hsl_colour;
}
