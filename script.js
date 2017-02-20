(() => {
    const boxes = $('.box');

    var backDisabled = true,
        forwardDisabled = false;

    var backCount = 0,
        forwardCount = 0;

    var y_space = 1,
        z_space = 20;

    var z_index = boxes.length,
        current_index = 1,
        translate_y = y_space * -1,
        translate_z = z_space * -1;

    boxes.each(function() {
        this.style['-webkit-transform'] = 'translate3d(0px, ' + translate_y + 'px, ' + translate_z + 'px)';
        this.style['z-index'] = z_index;

        $(this).data('translate_y', translate_y);
        $(this).data('translate_z', translate_z);

        z_index--;
        translate_y -= y_space;
        translate_z -= z_space;

    });

    // determine mouse scrolling
    $('.viewport').bind('mousewheel', function(e) {
        var movement = e.originalEvent.wheelDelta;

        if (movement > 0) {
            back();
        } else {
            forward();
        }
    });

    function forward() {
        if (forwardDisabled)
            return false;
        boxes.each(function() {
            animate_stack(this, y_space, z_space);
        });
        forwardCount += 0.1;
        if(forwardCount > 1) {
            boxes.filter(':nth-child(' + current_index + ')').css('opacity', 0);
            current_index++;
            forwardCount = 0;
        }
        console.log(current_index, boxes.length);
        check_buttons();
    }

    function back() {
        if (backDisabled)
            return false;
        boxes.each(function() {
            animate_stack(this, -y_space, -z_space);
        });
        backCount += 0.1;
        if(backCount > 1) {
            boxes.filter(':nth-child(' + (current_index - 1) + ')').css('opacity', 1);
            current_index--;
            backCount = 0;
        }
        console.log(backCount);
        check_buttons();
    }

    function check_buttons() {
        if (current_index == 1) {
            backDisabled = true;
        } else {
            backDisabled = false;
        }

        if (current_index == boxes.length) {
            forwardDisabled = true;
        } else {
            forwardDisabled = false;
        }
    }

    function animate_stack(obj, y, z) {

        var new_y = $(obj).data('translate_y') + y;
        var new_z = $(obj).data('translate_z') + z;

        obj.style['-webkit-transform'] = 'translate3d(0px, ' + new_y + 'px, ' + new_z + 'px)';

        $(obj).data('translate_z', new_z).data('translate_y', new_y);

    }

})();
