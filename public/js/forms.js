(function () {
'use strict';
var btn = {
    delete: function () {
        return $('<button type="button" class="nf_listfield_delete"><i class="icon-remove"></i></button>')
            .click(function (e) {
                e.preventDefault();
                $($(this).parent()).slideUp(400, function () {
                    $(this).remove();
                });
            });
    },
    drag: function () {
        return $('<div class="nf_listfield_drag"><i title="Drag to reorder" class="icon-resize-vertical"></i></div>');
    },
    add: function() {
        return $('<button type="button" class="nf_add btn btn-warning"><i class="icon-plus icon-white"></i> Add Item</button>');
    }
};

function initFieldSet(ctx) {
    if (!ctx) {
        $('.nf_fieldset').addClass('closed');
        $('.error')
            .parents('.nf_fieldset > div').show()
            .parents('.nf_fieldset').removeClass('closed');
    }

    $('.nf_fieldset', ctx).each(function() {
        if ($(this).data('nf_fieldset'))
            return;
        $(this).data('nf_fieldset', true);

        var t = $(this),
            h2 = $('> h2', t),
            div = $('> div', t),
            i = $('<i class="icon-chevron-right" />').prependTo(t);

        t.css('min-height', h2.height());

        t.off('click').click(function(e) {
            var is_closed = t.is('.closed');
            if (!(is_closed || $(e.target).is(h2) || $(e.target).is(i)))
                return;

            i.toggleClass('icon-chevron-right icon-chevron-down');

            t.toggleClass('closed');
            div.stop(1,1).slideToggle('fast');
        });
    });
}

function ListField(el) {
    var self = this;
    self.el = $(el);

    self.init = function() {
        if (self.el.data('processed') == 'true')
            return;
        self.el.data('processed','true');

        self.el.closest('.field').addClass('nf_listfield_container');

        self.name = self.el.attr('name');

        var tpl = $('> .nf_hidden_template', el);
        tpl.find(".nf_listfield").addClass('closed');
        self.template = tpl.html();
        tpl.remove();

        self.list = $('> ul', el)
            .after(btn.add().click(self.add));

        self.length = $('> li', self.list)
            .append(btn.drag())
            .append(btn.delete())
            .length;

        self.list.sortable({
            items: 'li:not(.new_li)',
            handle: '.nf_listfield_drag'
        });

        initWidgets(this);
    };

    self.add = function(e) {
        e.preventDefault();

        var li = $('<li />').hide()
            .append(self.template)
            .append(btn.delete())
            .append(btn.drag())
            .insertBefore(this)
            .slideDown(function() {
                $('input:first', li).focus();
            });

        $('[name]', li).each(function() {
            var input = $(this),
                name = input.attr('name').replace(self.name + '_tmpl_', self.name + '_li' + self.length + '_');

            input.attr('name', name);
        });

        self.length++;

        // load nested widgets
        initWidgets(li);
    };

    self.init();
}


function initWidgets(ctx) {
    $('.nf_listfield', ctx).each(function() {
        $(this).data('listfield', new ListField(this));
    });
    initFieldSet(ctx);
    $('select', ctx).select2();
    $('.nf_datepicker', ctx).datepicker({format: 'yyyy-mm-dd'});
    $('.nf_timepicker', ctx).timepicker();
}


$(function(){
    $('.optional_label').each(function() {
        $('label[for="' + this.id  + '"]').addClass('optional_label');
    });

    initWidgets();

    $('form#document').submit(function() {
        $('p.submit button').prop('disabled', true);
    });
});
})();
