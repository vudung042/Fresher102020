﻿class BaseJS {
    constructor() {
        this.host = "http://api.manhnv.net";
        this.apiRouter = null;
        this.setApiRouter();
        this.initEvents();
        this.initEventDelete();
        this.loadData();
    }

    setApiRouter() {

    }

    initEvents() {
        var me = this;
        // Sự kiện click khi nhấn thêm mới:
        $('#btnAdd').click(me.btnAddOnClick.bind(me));

        // Load lại dữ liệu khi nhấn button nạp:
        $('#btnRefresh').click(function () {
            me.loadData();
        })

        // $('#btnRefresh').click(function () {
        //     me.loadData();
        // })

        // Ẩn form chi tiết khi nhấn hủy:
        $('#btnCancel').click(function () {
            // Hiển thị dialog thông tin chi tiết:
            dialogDetail.dialog('close');
        })

        // Xử lý dữ liệu button [Lưu] trên form chi tiết:
        $('#btnSave').click(me.btnSaveOnClick.bind(me));

        // $('table tbody').click(function(){
        //     $(this).find('td').addClass('row-selected');
        // })
        // Hiển thị thông tin chi tiết khi nhấn đúp chuột chọn 1 bản ghi trên danh sách dữ liệu:
        $('table tbody').on('dblclick', 'tr', function () {
            // load dữ liệu cho các combobox:
            var selects = $('select[fieldName]');
            selects.empty();
            $.each(selects, function (index, select) {
                // lấy dữ liệu nhóm khách hàng:
                var api = $(select).attr('api');
                var fieldName = $(select).attr('fieldName');
                var fieldValue = $(select).attr('fieldValue');
                $('.loading').show();
                $.ajax({
                    url: me.host + api,
                    method: "GET",
                    async: true
                }).done(function (res) {
                    if (res) {
                        console.log(res);
                        $.each(res, function (index, obj) {
                            var option = $(`<option value="${obj[fieldValue]}">${obj[fieldName]}</option>`);
                            console.log(select);
                            $(select).append(option);
                            console.log(option);
                        })
                    }
                    $('.loading').hide();
                }).fail(function (res) {
                    $('.loading').hide();
                })
            })
            
            me.FormMode = 'Edit';
            $('#btnDelete-dialog').show();
            // Lấy khóa chính của bản ghi:
            var recordId = $(this).data('recordId');
            me.recordId = recordId;
            console.log(recordId);
            // Gọi service lấy thông tin chi tiết qua Id:
            $.ajax({
                url: me.host + me.apiRouter + `/${recordId}`,
                method: "GET",
                async: true
            }).done(function (res) {
                // Binding dữ liệu lên form chi tiết:
                console.log(res);

                // Lấy tất cả các control nhập liệu:
                var inputs = $('input[fieldName], select[fieldName]');
                var entity = {};
                $.each(inputs, function (index, input) {
                    var propertyName = $(this).attr('fieldName');
                    var value = res[propertyName];

                    // // Đối với dropdowlist (select option):
                    // if (this.tagName == "SELECT") {
                    //     var propValueName = $(this).attr('fieldValue');
                    //     value = res[propValueName];
                    // }
                    // Đối với các input là radio:
                    if ($(this).attr('type') == "radio") {
                        var inputValue = this.value;

                        if (value == inputValue) {
                            this.checked = true;
                        } else {
                            this.checked = false;
                        }
                    } else {
                        $(this).val(value);
                    }
                })
            }).fail(function (res) {

            })


            dialogDetail.dialog('open');
        })

        /* --------------------
         * validate yêu cầu nhập
         * CreatedBy: NTDong(14/11/2020)
         */
        $('input[required]').blur(function () {
            // Kiểm tra dữ liệu đã nhập, cảnh báo nếu dữ liệu trống 
            var value = $(this).val();
            if (!value) {
                $(this).addClass('border-red');
                $(this).attr('title', 'Trường này không được phép để trống');
                $(this).attr("validate", false);
            } else {
                $(this).removeClass('border-red');
                $(this).attr("validate", true);
            }

        })

        /* --------------------------
        * validate email đúng yêu cầu
        * CreatedBy: NTDong(14/11/2020)
        */
        $('input[type="email"]').blur(function () {
            var value = $(this).val();
            var testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
            if (!testEmail.test(value)) {
                $(this).addClass('border-red');
                $(this).attr('title', 'Email không đúng định dạng.');
                $(this).attr("validate", false);
            } else {
                $(this).removeClass('border-red');
                $(this).attr("validate", true);
            }
        })
    }

    /**
     * Xử lý form xóa khách hàng
     */
    initEventDelete(){
        var me = this;
        // Đóng form xóa khách hàng
        $('#d-cancle').click(function(){
            dialogDelete.dialog('close');
        })
        // Ấn button btnDelete để hiện form delete
        $('#btnDelete-dialog').click(function(){
            dialogDelete.dialog('open');
        })        
        // Xử lý dữ liệu button [Xóa] trên form chi tiết:
        $('#d-delete').click(me.btnDeleteOnClick.bind(me));
    }

    /**
     * hàm xử lý khi xóa 1 khách hàng 
     * createdBy:NTDong(19/11/2020)
    */
    btnDeleteOnClick(){
        var me = this;
        // Lấy thông tin bản ghi đang chọn
        var recordId = me.recordId;
        console.log(recordId);
        debugger;
        $.ajax({
            url: me.host + me.apiRouter + `/${recordId}`,
            method: "DELETE",
            async:true
        }).done(function(res){
            //Thông báo xóa thành công
            alert('Đã xóa thành công !');
            //Đóng form dialog
            dialogDelete.dialog('close');
            //đóng form dialogdetail
            dialogDetail.dialog('close');
            //Load lại dữ liệu bảng ghi 
            me.loadData();
        }).fail(function(res){
            console.log(res);
        })
    }

    /** ------------
     * Load dữ liệu
     * CreatedBy: NTDong(12/11/2020)
     * */
    loadData() {
        var me = this;
        try {
            $('table tbody').empty();
            // Lấy thông tin các cột dữ liệu:
            var columns = $('table thead th');
            var getDataUrl = this.getDataUrl;
            $('.loading').show();
            $.ajax({
                url: me.host + me.apiRouter,
                method: "GET",
                async: true,
            }).done(function (res) {
                $.each(res, function (index, obj) {
                    var tr = $(`<tr></tr>`);
                    $(tr).data('recordId', obj.CustomerId);
                    // Lấy thông tin dữ liệu sẽ map tương ứng với các cột:
                    $.each(columns, function (index, th) {
                        var td = $(`<td><div><span></span></div></td>`);
                        var fieldName = $(th).attr('fieldname');
                        var value = obj[fieldName];
                        var formatType = $(th).attr('formatType');
                        switch (formatType) {
                            case "ddmmyyyy":
                                td.addClass("text-align-center");
                                value = formatDate(value);
                                break;
                            case "Money":
                                td.addClass("text-align-right");
                                value = formatMoney(value);
                                break;
                            default:
                                break;
                        }

                        td.append(value);
                        $(tr).append(td);
                    })
                    $('table tbody').append(tr);
                    $('.loading').hide();
                })
            }).fail(function (res) {
                $('.loading').hide();
            })
        } catch (e) {
            console.log(e);
        }
    }

    // if (me.FormMode == 'Add') {
    //     $('#btnDelete-dialog').hide()
    // }
    // else{
    //     $('#btnDelete-dialog').show();
    // }
    /** ------------------------
     * Hàm xử lý khi nhấn button thêm mới
     * CreatedBy: NTDong(18/11/2020)
     * */
    btnAddOnClick() {
        try {
            var me = this;
            me.FormMode = 'Add';
            $('#btnDelete-dialog').hide();

            // Hiển thị dialog thông tin chi tiết:
            dialogDetail.dialog('open');
            $('input').val(null);
            // load dữ liệu cho các combobox:
            var select = $('select#cbxCustomerGroup');
            select.empty();
            // lấy dữ liệu nhóm khách hàng:
            $('.loading').show();
            $.ajax({
                url: me.host + "/api/customergroups",
                method: "GET"
            }).done(function (res) {
                if (res) {
                    console.log(res);
                    $.each(res, function (index, obj) {
                        var option = $(`<option value="${obj.CustomerGroupId}">${obj.CustomerGroupName}</option>`);
                        select.append(option);
                        console.log(option);
                    })
                }
                $('.loading').hide();
            }).fail(function (res) {
                $('.loading').hide();
            })
        } catch (e) {
            console.log(e);
        }
    }

    /** ---------------------------
     * Xử lý button Save
     * Author: NTDong (18/11/2020)
     * */
    btnSaveOnClick() {
        var me = this;
        // validate dữ liệu:
        var inputVaidates = $('input[required], input[type="email"]');
        $.each(inputVaidates, function (index, input) {
            $(input).trigger('blur');
        })
        var inputNotValids = $('input[validate="false"]');
        if (inputNotValids && inputNotValids.length > 0) {
            alert("Dữ liệu không hợp lệ vui lòng kiểm tra lại.");
            inputNotValids[0].focus();
            return;
        }
        // thu thập thông tin dữ liệu được nhập -> build thành object:
        // Lấy tất cả các control nhập liệu:
        var inputs = $('input[fieldName], select[fieldName]');
        var entity = {};
        $.each(inputs, function (index, input) {
            var propertyName = $(this).attr('fieldName');
            var value = $(this).val();

            // Check với trường hợp input là radio, thì chỉ lấy value của input có attribute là checked:
            if ($(this).attr('type') == "radio") {
                if (this.checked) {
                    entity[propertyName] = value;
                }
            } else {
                entity[propertyName] = value;
            }

            if (this.tagName == "SELECT") {
                var propertyName = $(this).attr('fieldValue');
                entity[propertyName] = value;
            }
        })
        entity["CustomerGroupId"] = "19165ed7-212e-21c4-0428-030d4265475f";
        var method = "POST";
        if (me.FormMode == 'Edit') {
            method = "PUT";
            entity.CustomerId = me.recordId;
        }
        // Gọi service tương ứng thực hiện lưu dữ liệu:
        $.ajax({
            url: me.host + me.apiRouter,
            method: method,
            data: JSON.stringify(entity),
            contentType: 'application/json'
        }).done(function (res) {
            // Sau khi lưu thành công thì:
            // Thông báo Thành công , đóng dialog và load lại dữ liệu bảng
            alert('Đã thêm thành công !!! ');
            dialogDetail.dialog('close');
            me.loadData();
            // debugger
        }).fail(function (res) {
            // debugger
        })
    }
}