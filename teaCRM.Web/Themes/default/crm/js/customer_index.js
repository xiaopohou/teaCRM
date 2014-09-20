﻿//*客户JS函数
//*作者：唐有炜
//*时间：2014年08月25日

//====================================================================
//全局变量
var manager;
var manager1;
var view_auth = false;


$(document).ready(function() {
    createTree();
    //加载客户、联系人、跟进信息
    InitDataGrid();
});


$(function() {

});

//ZTree==========================================================================
//=================================================================================
//异步加载节点
function createTree() {
    var setting = {
        data: {
            simpleData: {
                enable: true,
                idKey: "id",
                pIdKey: "pId",
                rootPId: 0
            }
        },
        async: {
            //异步加载
            enable: true,
            url: "/Apps/CRM/LoadData/AsyncGetNodes/",
            autoParam: ["id", "name", "pId"]
        },
        callback: {
            beforeExpand: function(treeId, treeNode) {
                if (!treeNode.isAjaxing) {
                    return true;
                } else {
                    //alert("zTree 正在下载数据中，请稍后展开节点。。。");
                    return false;
                }
            },
            onAsyncSuccess: function(event, treeId, treeNode, msg) {


            },
            onAsyncError: function() {
                //alert(" 数据加载失败");
            },
            onClick: function(event, treeId, treeNode, clickFlag) {
                alert("你选中的节点数据：" + treeNode.id + " " + treeNode.name);
            }
        }
    };
    $.ajax({
        url: '/Apps/CRM/LoadData/AsyncGetNodes/', //url  action是方法的名称
        data: { id: 0 },
        type: 'Get',
        dataType: "text", //可以是text，如果用text，返回的结果为字符串；如果需要json格式的，可是设置为json
        success: function(data) {
            $.fn.zTree.init($("#filter_tree"), setting, eval('(' + data + ')'));
            //展开一级
            var json_data = eval('(' + data + ')');
            for (var index in json_data) {
                var tnode = json_data[index];
                //console.log(tnode);
                var treeObj = $.fn.zTree.getZTreeObj("filter_tree");
                var node = treeObj.getNodeByParam("id", tnode.id, null);
                treeObj.expandNode(node, true, true, true);
            }
        },
        error: function(msg) {
            alert(" 数据加载失败！" + msg);
        }
    });
}

//=============================================================================================


//根据id集合获取省市信息=========================================================================
//需要引用 <script src="/Themes/default/base/js/city.js" type="text/javascript"></script>
// 2014-09-04 By 唐有炜
function get_city_by_ids(ids) {
    return "省市信息";
}

//查看客户信息
function view(id) {
    showContentWindow("show_add", "/Apps/CRM/Index/Show/" + id, "查看客户", 800, 480);
}

function context_view() {
    var manager = $("#maingrid4").ligerGetGridManager();
    var row = manager.getSelectedRow();
    console.log(row);
    if (row) {
        showContentWindow("show_add", "/Apps/CRM/Index/Show/" + row.id, "查看客户", 800, 480);
    } else {
        showMsg("请先选中客户！", "Error");
    }
}


//添加客户
function add() {
    showWindow("show_add", "/Apps/CRM/Index/Add/", "新增客户", 800, 480, function() {
        var form_customer = $(window.frames["frm_show_add"].document).find("#form_customer");
        //var data = $(form_customer).serialize();
        //alert(data);
        //表单验证
        //validate_form();
        var flag = document.getElementById("frm_show_add").contentWindow.form_valid();
        if (!flag) {
            return false;
        }
        var data = $(form_customer).serialize();
        //console.log(data);
        //提交数据
        var url = "/Apps/CRM/Index/Add/";
        $.ajax({
            type: "post",
            cache: false,
            url: url,
            data: data,
            dataType: "json",
            beforeSend: function() {
                //showMsg("添加中，请稍后...");
            },
            complete: function() {
                //d.close().remove();
            },
            success: function(result) {
                //toLowerCase报错
                //var status = result.Status.toLowerCase();
                var status = result.Status;
                if (status == true || status == "true" || status == "True") {
                    //在iframe里面打开弹出框并自动关闭
                    showMsg(result.Msg, "Success");
                    //刷新数据
                    customer_reload();
                } else {
                    showMsg("系统异常！", "Error");
                }
            },
            error: function() {
                showMsg("网络连接错误");
            }
        });

    });
}


function edit() {
    view();
}

function del() {
    to_trash();
}

//删除（放入回收站）
function to_trash() {
    var manager = $("#maingrid4").ligerGetGridManager();
    var row = manager.getSelectedRow();
    if (row) {
        //                $.ligerDialog.confirm("确定删除？", function(yes) {
        //                    if (yes) {
        //                        $.ajax({
        //                            url: "../../data/CRM_Customer.ashx",
        //                            type: "POST",
        //                            data: { Action: "AdvanceDelete", id: row.id, rnd: Math.random() },
        //                            success: function(result) {
        //                                if (result == "true") {
        //                                    f_reload();
        //                                    f_followreload();
        //                                } else if (result == "delfalse") {
        //                                    top.$.ligerDialog.error('权限不够，删除失败！');
        //                                } else if (result == "false") {
        //                                    top.$.ligerDialog.error('未知错误，删除失败！');
        //                                } else {
        //                                    top.$.ligerDialog.warn('此客户下含有 ' + result + '，删除失败！请先先将这些数据放入回收站。');
        //                                }
        //
        //                            },
        //                            error: function() {
        //                                top.$.ligerDialog.error('删除失败！');
        //                            }
        //                   });
        //                    }
        //                });
        //showDialog(row.id);
        showDialog("确认删除吗？（超级管理员可在回收站恢复）", function() {


            $.ajax({
                url: "/Apps/CRM/LoadData/ToTrash/",
                cache: false,
                type: "POST",
                data: { cus_id: row.id, rnd: Math.random() },
                success: function(result) {
                    var status = result.Status;
                    if (status == true || status == "true" || status == "True") {
                        showMsg("删除成功！", "Success");
                        f_reload();
                    } else {
                        showMsg("删除失败！", "Error");
                    }
                },
                error: function() {
                    showMsg("操作失败！", "Error");
                }
            });
        });


    } else {
        //$.ligerDialog.warn("请选择客户");
        showMsg("请选择客户！");
    }


}

//放入公海
function to_pub() {
    var manager = $("#maingrid4").ligerGetGridManager();
    var row = manager.getSelectedRow();
    if (row) {
        showDialog("确认放入公海吗？", function() {
            $.ajax({
                url: "/Apps/CRM/LoadData/ToPub/",
                cache: false,
                type: "POST",
                data: { cus_id: row.id, rnd: Math.random() },
                success: function(result) {
                    var status = result.Status;
                    if (status == true || status == "true" || status == "True") {
                        showMsg("放入公海成功！");
                        f_reload();
                    } else {
                        showMsg("放入公海失败！");
                    }
                },
                error: function() {
                    showMsg("操作失败！");
                }
            });
        });
    } else {
        showMsg("请选择客户！");
    }
}

//重新加载客户数据
function customer_reload() {
    var manager = $("#maingrid4").ligerGetGridManager();
    manager.loadData(true);
};