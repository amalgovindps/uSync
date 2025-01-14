﻿
angular.module("umbraco").controller("SyncDatacontroller", function ($http, $scope, umbRequestHelper, contentResource, appState) {

    var vm = this;
    $scope.currentPage = 1;
    $scope.numPerPage = 3;
    $scope.totalItems = 0;
    $scope.numberofPage = 0;
    $scope.gap = 5;
    var settingsmodal = document.getElementById("settingsModel");
    var contentsmodal = document.getElementById("contentModel");
    var importModal = document.getElementById("impModel");
    var userModal = document.getElementById("userModel");
    var memberModal = document.getElementById("memberModel");
    var modal = document.getElementById("myModal");
    var rootNodes = [];
    var apiUrl = umbRequestHelper.getApiUrl("publishBaseUrl", "")
    var exportApiUrl = umbRequestHelper.getApiUrl("exportBaseUrl", "");
    var importApiUrl = umbRequestHelper.getApiUrl("importBaseUrl", "");
    vm.url = document.getElementById("urlAddress");
    vm.newData = document.getElementById("newValue");
    var msg = document.getElementById("message");
    var msgErr = document.getElementById("messageError");
    var span = document.getElementsByClassName("close")[0];

    vm.testModal = function () {
        //debugger;
        settingsmodal.style.display = "block";
        modalTest.style.display = "block";
        $scope.interfaces.push("Macro");

        //setTimeout(() => { $scope.interfaces.push("Media"); }, 1)
        //setTimeout(() => { }, 2)
    }
    span.onclick = function () {
        if (modal != undefined) { modal.style.display = "none"; }
        importModal.style.display = "none";
    };
    vm.close = function () {
        userModal.style.display = "none";
        memberModal.style.display = "none";
        settingsmodal.style.display = "none";
        contentsmodal.style.display = "none";

    }
    angular.element(document).ready(function () {
        vm.nodesList = [];
        var nodes = appState.getTreeState("currentRootNode");
        var rootNodes = nodes.root.children.filter(function (item) {
            if (item.id > 0) return item;
        });
        vm.nodesList = rootNodes.map(function (node) {
            return {
                IdVal: node.id,
                NameVal: node.name,
                Selected: false
            };
        });
        $scope.totalItems = vm.nodesList.length;
    });
    vm.selectRow = function ($event, row, rows) {
        //de-select all
        angular.forEach(rows, function (r) { r.selected = false; });
        //select clicked
        row.selected = !row.selected;
        flow3.selectedItem = row;
        document.getElementById("selectNode").value = row.IdVal;
    }
    $scope.prevPage = function () {
        debugger;
        if ($scope.currentPage > 1) {
            $scope.currentPage--;
        }
    };
    $scope.nextPage = function () {
        debugger;
        var rem = $scope.totalItems / $scope.numPerPage;

        if ($scope.currentPage < rem) {
            $scope.currentPage++;
        }
    };
    $scope.setPage = function (n) {
        $scope.currentPage = n;
    };
    $scope.paginate = function (value) {
        var begin, end, index;
        begin = ($scope.currentPage - 1) * $scope.numPerPage;
        $scope.numberofPage = Math.round($scope.totalItems / $scope.numPerPage) + 1;
        end = begin + $scope.numPerPage;
        index = vm.nodesList.indexOf(value);
        return (begin <= index && index < end);
    };
   

    /********Export Import work******** */
    vm.settingImport = async function setting() {
        debugger;
        $scope.interfaces = [];
        settingsmodal.style.display = "block";
        var resp = await $http.get(importApiUrl + 'HeartBeat').then(function (response) { return response; }).catch(error => { alert("No connection " + error); });
        if (resp.status == 200) {
            $scope.interfaces.push("Macro");
            resp = await $http.get(importApiUrl + 'ImportMacro').then(x => { return x; }).catch(error => { alert(error + "ImportMacro"); });
            if (resp.status == 200) {
                $scope.interfaces.push("Language");
                resp = await $http.get(importApiUrl + 'ImportLanguage').then(x => { return x; }).catch(error => { alert(error + "ImportLanguage"); });
                if (resp.status == 200) {
                    $scope.interfaces.push("DataType");
                    resp = await $http.get(importApiUrl + 'ImportDataType').then(x => { return x; }).catch(error => { alert(error + "ImportDataType"); });
                    if (resp.status == 200) {
                        $scope.interfaces.push("Template");
                        resp = await $http.get(importApiUrl + 'ImportTemplate').then(x => { return x; }).catch(error => { alert(error + "ImportTemplate"); });
                        if (resp.status == 200) {
                            $scope.interfaces.push("DocType");
                            resp = await $http.get(importApiUrl + 'ImportDocType').then(x => { return x; }).catch(error => { alert(error + "ImportDocType"); });
                            if (resp.status == 200) {
                                $scope.interfaces.push("MediaType");
                                resp = await $http.get(importApiUrl + 'ImportMediaType').then(x => { return x; }).catch(error => { alert(error + "ImportMediaType"); });
                                if (resp.status == 200) {
                                    $scope.interfaces.push("MemberType");
                                    resp = await $http.get(importApiUrl + 'ImportMemberType').then(x => { return x; }).catch(error => { alert(error + "ImportMemberType"); });
                                    if (resp.status == 200) {
                                        setTimeout(() => { alert("Import complete"); settingsmodal.style.display = "none"; $scope.interfaces = []; }, 2)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    vm.settingExport = async function setting() {
        debugger;
        $scope.interfaces = [];
        settingsmodal.style.display = "block";
        var resp = await $http.get(importApiUrl + 'HeartBeat').then(function (response) { return response; }).catch(error => { alert("No connection " + error); });
        if (resp.status == 200) {
            resp = await $http.get(exportApiUrl + 'ExportLanguage').then(x => { return x; }).catch(error => { alert(error + "ExportLanguage"); });
            $scope.interfaces.push("Language");
            if (resp.status == 200) {
                resp = await $http.get(exportApiUrl + 'ExportDataType').then(x => { return x; }).catch(error => { alert(error + "ExportDataType"); });
                $scope.interfaces.push("DataType");
                if (resp.status == 200) {
                    resp = await $http.get(exportApiUrl + 'ExportTemplate').then(x => { return x; }).catch(error => { alert(error + "ExportTemplate"); });
                    $scope.interfaces.push("Template");
                    if (resp.status == 200) {
                        resp = await $http.get(exportApiUrl + 'ExportDocType').then(x => { return x; }).catch(error => { alert(error + "ExportDocType"); });
                        $scope.interfaces.push("DocType");
                        if (resp.status == 200) {
                            resp = await $http.get(exportApiUrl + 'ExportMediaType').then(x => { return x; }).catch(error => { alert(error + "ExportMediaType"); });
                            $scope.interfaces.push("MediaType");
                            if (resp.status == 200) {
                                resp = await $http.get(exportApiUrl + 'ExportMemberType').then(x => { return x; }).catch(error => { alert(error + "ExportMemberType"); });
                                $scope.interfaces.push("MemberType");
                                if (resp.status == 200) {
                                    resp = await $http.get(exportApiUrl + 'ExportMacro').then(x => { return x; }).catch(error => { alert(error + "ExportMacro"); });
                                    $scope.interfaces.push("Macro");
                                    if (resp.status == 200) {
                                        setTimeout(() => { settingsmodal.style.display = "none"; $scope.interfaces = []; alert("Export Completed"); }, 2);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    vm.contentImport = async function content() {
        $scope.interfaces = [];
        contentsmodal.style.display = "block";
        var resp = await $http.get(importApiUrl + 'HeartBeat').then(function (response) { return response; }).catch(error => { alert("No connection " + error); });
        if (resp.status == 200) {
            $scope.interfaces.push("Dictionary");
            resp = await $http.get(importApiUrl + 'ImportDictionary').then(x => { return x; }).catch(error => { alert(error + "ImportDictionary"); });
            if (resp.status == 200) {
            } $scope.interfaces.push("Media");
            resp = await $http.get(importApiUrl + 'ImportMedia').then(x => { return x; }).catch(error => { alert(error + "ImportMedia"); });
            if (resp.status == 200) {
                $scope.interfaces.push("Content");
                resp = await $http.get(importApiUrl + 'ImportContent').then(x => { return x; }).catch(error => { alert(error + "ImportContent"); });
                if (resp.status == 200) {
                    $scope.interfaces.push("Blueprint");
                    resp = await $http.get(importApiUrl + 'ImportBlueprint').then(x => { return x; }).catch(error => { alert(error + "ImportBlueprint"); });
                    if (resp.status == 200) {
                        $scope.interfaces.push("Domain");
                        resp = await $http.get(importApiUrl + 'ImportDomain').then(x => { return x; }).catch(error => { alert(error + "ImportDomain"); });
                        if (resp.status == 200) {
                            $scope.interfaces.push("Relation");
                            resp = await $http.get(importApiUrl + 'ImportRelation').then(x => { return x; }).catch(error => { alert(error + "ImportRelation"); });
                            if (resp.status == 200) {
                                setTimeout(() => { contentsmodal.style.display = "none"; $scope.interfaces = []; alert("Import complete"); }, 2)
                            }
                        }
                    }
                }
            }
        }
    }
    vm.contentExport = async function content() {
        $scope.interfaces = [];
        contentsmodal.style.display = "block";
        var resp = await $http.get(importApiUrl + 'HeartBeat').then(function (response) { return response; }).catch(error => { alert("No connection " + error); });
        if (resp.status == 200) {
            $scope.interfaces.push("Dictionary");
            resp = await $http.get(exportApiUrl + 'ExportDictionary').then(x => { return x; }).catch(error => { alert(error + "ExportDictionary"); });
            if (resp.status == 200) {
                $scope.interfaces.push("Media");
                resp = await $http.get(exportApiUrl + 'ExportMedia').then(x => { return x; }).catch(error => { alert(error + "ExportMedia"); });
                if (resp.status == 200) {
                    $scope.interfaces.push("Content");
                    resp = await $http.get(exportApiUrl + 'ExportContent').then(x => { return x; }).catch(error => { alert(error + "ExportContent"); });
                    if (resp.status == 200) {
                        $scope.interfaces.push("Blueprint");
                        resp = await $http.get(exportApiUrl + 'ExportBlueprint').then(x => { return x; }).catch(error => { alert(error + "ExportBlueprint"); });
                        if (resp.status == 200) {
                            $scope.interfaces.push("Domain");
                            resp = await $http.get(exportApiUrl + 'ExportDomain').then(x => { return x; }).catch(error => { alert(error + "ExportDomain"); });
                            if (resp.status == 200) {
                                $scope.interfaces.push("Relation");
                                resp = await $http.get(exportApiUrl + 'ExportRelation').then(x => { return x; }).catch(error => { alert(error + "ExportRelation"); });
                                if (resp.status == 200) {
                                    setTimeout(() => { contentsmodal.style.display = "none"; $scope.interfaces = []; alert("Export Completed"); }, 2);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    vm.export = async function exportItems() {
        $scope.interfaces = [];
        importModal.style.display = "block";

        var resp = await $http.get(exportApiUrl + 'HeartBeat').then(x => { return x; }).catch(error => { alert("Export erorr" + error); });
        if (resp.status == 200) {
            $scope.interfaces.push("Language");
            resp = await $http.get(exportApiUrl + 'ExportLanguage').then(x => { return x; }).catch(error => { alert(error + "ExportLanguage"); });
            if (resp.status == 200) {
                $scope.interfaces.push("UserGroups");
                var resp = await $http.get(exportApiUrl + 'ExportUserGroups').then(x => { return x; }).catch(error => { alert(error + "ExportUserGroups"); });
                if (resp.status == 200) {
                    $scope.interfaces.push("Users");
                    var resp = await $http.get(exportApiUrl + 'ExportUsers').then(x => { return x; }).catch(error => { alert(error + "ExportUsers"); });
                    if (resp.status == 200) {
                        $scope.interfaces.push("Dictionary");
                        resp = await $http.get(exportApiUrl + 'ExportDictionary').then(x => { return x; }).catch(error => { alert(error + "ExportDictionary"); });
                        if (resp.status == 200) {
                            $scope.interfaces.push("DataType");
                            resp = await $http.get(exportApiUrl + 'ExportDataType').then(x => { return x; }).catch(error => { alert(error + "ExportDataType"); });
                            if (resp.status == 200) {
                                $scope.interfaces.push("Template");
                                resp = await $http.get(exportApiUrl + 'ExportTemplate').then(x => { return x; }).catch(error => { alert(error + "ExportTemplate"); });
                                if (resp.status == 200) {
                                    $scope.interfaces.push("DocType");
                                    resp = await $http.get(exportApiUrl + 'ExportDocType').then(x => { return x; }).catch(error => { alert(error + "ExportDocType"); });
                                    if (resp.status == 200) {
                                        $scope.interfaces.push("MediaType");
                                        resp = await $http.get(exportApiUrl + 'ExportMediaType').then(x => { return x; }).catch(error => { alert(error + "ExportMediaType"); });
                                        if (resp.status == 200) {
                                            $scope.interfaces.push("MemberType");
                                            resp = await $http.get(exportApiUrl + 'ExportMemberType').then(x => { return x; }).catch(error => { alert(error + "ExportMemberType"); });
                                            if (resp.status == 200) {
                                                $scope.interfaces.push("MemberGroup");
                                                var resp = await $http.get(exportApiUrl + 'ExportMemberGroups').then(x => { return x; }).catch(error => { alert(error + "ExportMemberGroups"); });
                                                if (resp.status == 200) {
                                                    $scope.interfaces.push("Member");
                                                    var resp = await $http.get(exportApiUrl + 'ExportMembers').then(x => { return x; }).catch(error => { alert(error + "ExportMembers"); });
                                                    if (resp.status == 200) {
                                                        $scope.interfaces.push("Macro");
                                                        resp = await $http.get(exportApiUrl + 'ExportMacro').then(x => { return x; }).catch(error => { alert(error + "ExportMacro"); });
                                                        if (resp.status == 200) {
                                                            $scope.interfaces.push("Media");
                                                            resp = await $http.get(exportApiUrl + 'ExportMedia').then(x => { return x; }).catch(error => { alert(error + "ExportMedia"); });
                                                            if (resp.status == 200) {
                                                                $scope.interfaces.push("Content");
                                                                resp = await $http.get(exportApiUrl + 'ExportContent').then(x => { return x; }).catch(error => { alert(error + "ExportContent"); });
                                                                if (resp.status == 200) {
                                                                    $scope.interfaces.push("Blueprint");
                                                                    resp = await $http.get(exportApiUrl + 'ExportBlueprint').then(x => { return x; }).catch(error => { alert(error + "ExportBlueprint"); });
                                                                    if (resp.status == 200) {
                                                                        $scope.interfaces.push("Domain");
                                                                        resp = await $http.get(exportApiUrl + 'ExportDomain').then(x => { return x; }).catch(error => { alert(error + "ExportDomain"); });
                                                                        if (resp.status == 200) {
                                                                            $scope.interfaces.push("Relation");
                                                                            resp = await $http.get(exportApiUrl + 'ExportRelation').then(x => { return x; }).catch(error => { alert(error + "ExportRelation"); });
                                                                            if (resp.status == 200) {
                                                                                setTimeout(() => { importModal.style.display = "none"; $scope.interfaces = []; alert("Export Completed"); }, 2);
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    vm.import = async function importItems() {
        $scope.interfaces = [];
        importModal.style.display = "block";
        var resp = await $http.get(importApiUrl + 'HeartBeat').then(function (response) { return response; }).catch(error => { alert("No connection " + error); });
        if (resp.status == 200) {
            $scope.interfaces.push("Language");
            resp = await $http.get(importApiUrl + 'ImportLanguage').then(x => { return x; }).catch(error => { alert(error + "ImportLanguage"); });
            if (resp.status == 200) {
                $scope.interfaces.push("UserGroups");
                var resp = await $http.get(importApiUrl + 'ImportUserGroups').then(x => { return x; }).catch(error => { alert(error + "ImportUserGroups"); });
                if (resp.status == 200) {
                    $scope.interfaces.push("Users");
                    var resp = await $http.get(importApiUrl + 'ImportUsers').then(x => { return x; }).catch(error => { alert(error + "ImportUsers"); });
                    if (resp.status == 200) {
                        $scope.interfaces.push("Dictionary");
                        resp = await $http.get(importApiUrl + 'ImportDictionary').then(x => { return x; }).catch(error => { alert(error + "ImportDictionary"); });
                        if (resp.status == 200) {
                            $scope.interfaces.push("DataType");
                            resp = await $http.get(importApiUrl + 'ImportDataType').then(x => { return x; }).catch(error => { alert(error + "ImportDataType"); });
                            if (resp.status == 200) {
                                $scope.interfaces.push("Template");
                                resp = await $http.get(importApiUrl + 'ImportTemplate').then(x => { return x; }).catch(error => { alert(error + "ImportTemplate"); });
                                if (resp.status == 200) {
                                    $scope.interfaces.push("DocType");
                                    resp = await $http.get(importApiUrl + 'ImportDocType').then(x => { return x; }).catch(error => { alert(error + "ImportDocType"); });
                                    if (resp.status == 200) {
                                        $scope.interfaces.push("MediaType");
                                        resp = await $http.get(importApiUrl + 'ImportMediaType').then(x => { return x; }).catch(error => { alert(error + "ImportMediaType"); });
                                        if (resp.status == 200) {
                                            $scope.interfaces.push("MemberType");
                                            resp = await $http.get(importApiUrl + 'ImportMemberType').then(x => { return x; }).catch(error => { alert(error + "ImportMemberType"); });
                                            if (resp.status == 200) {
                                                $scope.interfaces.push("MemberGroups");
                                                resp = await $http.get(importApiUrl + 'ImportMemberGroups').then(x => { return x; }).catch(error => { alert(error + "ImportMemberGroups"); });;
                                                if (resp.status == 200) {
                                                    $scope.interfaces.push("Member");
                                                    var resp = await $http.get(importApiUrl + 'ImportMembers').then(x => { return x; }).catch(error => { alert(error + "ImportMembers"); });;
                                                    if (resp.status == 200) {
                                                        $scope.interfaces.push("Macro");
                                                        resp = await $http.get(importApiUrl + 'ImportMacro').then(x => { return x; }).catch(error => { alert(error + "ImportMacro"); });
                                                        if (resp.status == 200) {
                                                            $scope.interfaces.push("Media");
                                                            resp = await $http.get(importApiUrl + 'ImportMedia').then(x => { return x; }).catch(error => { alert(error + "ImportMedia"); });
                                                            if (resp.status == 200) {
                                                                $scope.interfaces.push("Content");
                                                                resp = await $http.get(importApiUrl + 'ImportContent').then(x => { return x; }).catch(error => { alert(error + "ImportContent"); });
                                                                if (resp.status == 200) {
                                                                    $scope.interfaces.push("Blueprint");
                                                                    resp = await $http.get(importApiUrl + 'ImportBlueprint').then(x => { return x; }).catch(error => { alert(error + "ImportBlueprint"); });
                                                                    if (resp.status == 200) {
                                                                        $scope.interfaces.push("Domain");
                                                                        resp = await $http.get(importApiUrl + 'ImportDomain').then(x => { return x; }).catch(error => { alert(error + "ImportDomain"); });
                                                                        if (resp.status == 200) {
                                                                            $scope.interfaces.push("Relation");
                                                                            resp = await $http.get(importApiUrl + 'ImportRelation').then(x => { return x; }).catch(error => { alert(error + "ImportRelation"); });
                                                                            if (resp.status == 200) {
                                                                                setTimeout(() => { importModal.style.display = "none"; $scope.interfaces = []; alert("Import complete"); }, 2)
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    vm.usersexport = async function exportUsers() {
        $scope.interfaces = [];
        userModal.style.display = "block";
        var resp = await $http.get(exportApiUrl + 'HeartBeat').then(x => { return x; }).catch(error => { alert("Export erorr" + error); });
        debugger;
        if (resp.status == 200) {
            $scope.interfaces.push("UserGroups");
            var resp = await $http.get(exportApiUrl + 'ExportUserGroups').then(x => { return x; }).catch(error => { alert(error + "ExportUserGroups"); });
            if (resp.status == 200) {
                $scope.interfaces.push("Users");
                var resp = await $http.get(exportApiUrl + 'ExportUsers').then(x => { return x; }).catch(error => { alert(error + "ExportUsers"); });
                if (resp.status == 200) {
                    setTimeout(() => { userModal.style.display = "none"; $scope.interfaces = []; alert("Import complete"); }, 2)
                }
            }
        }

    }
    vm.usersimport = async function importUsers() {
        $scope.interfaces = [];
        userModal.style.display = "block";
        var resp = await $http.get(importApiUrl + 'HeartBeat').then(x => { return x; }).catch(error => { alert("Import error" + error); });
        if (resp.status == 200) {
            $scope.interfaces.push("UserGroups");
            var resp = await $http.get(importApiUrl + 'ImportUserGroups').then(x => { return x; }).catch(error => { alert(error + "ImportUserGroups"); });
            if (resp.status == 200) {
                $scope.interfaces.push("Users");
                var resp = await $http.get(importApiUrl + 'ImportUsers').then(x => { return x; }).catch(error => { alert(error + "ImportUsers"); });
                if (resp.status == 200) { setTimeout(() => { userModal.style.display = "none"; $scope.interfaces = []; alert("Import complete"); }, 2) }
            }
        }
    }
    vm.membersimport = async function importMembers() {
        $scope.interfaces = [];
        memberModal.style.display = "block";
        var resp = await $http.get(importApiUrl + 'HeartBeat').then(x => { return x; }).catch(error => { alert("Import error" + error); });
        if (resp.status == 200) {
            $scope.interfaces.push("MemberGroup");
            var resp = await $http.get(importApiUrl + 'ImportMemberGroups').then(x => { return x; }).catch(error => { alert(error + "ImportMemberGroups"); });;
            if (resp.status == 200) {
                $scope.interfaces.push("Member");
                var resp = await $http.get(importApiUrl + 'ImportMembers').then(x => { return x; }).catch(error => { alert(error + "ImportMembers"); });;
                if (resp.status == 200) {
                    setTimeout(() => { memberModal.style.display = "none"; $scope.interfaces = []; alert("Import complete"); }, 2)
                }
            }
        }
    }
    vm.membersexport = async function exportMembers() {
        $scope.interfaces = [];
        memberModal.style.display = "block";
        var resp = await $http.get(exportApiUrl + 'HeartBeat').then(x => { return x; }).catch(error => { alert("Export erorr" + error); });
        if (resp.status == 200) {
            $scope.interfaces.push("MemberGroup");
            var resp = await $http.get(exportApiUrl + 'ExportMemberGroups').then(x => { return x; }).catch(error => { alert(error + "ExportMemberGroups"); });
            if (resp.status == 200) {
                $scope.interfaces.push("Member");
                var resp = await $http.get(exportApiUrl + 'ExportMembers').then(x => { return x; }).catch(error => { alert(error + "ExportMembers"); });
                if (resp.status == 200) {
                    setTimeout(() => { memberModal.style.display = "none"; $scope.interfaces = []; alert("Import complete"); }, 2)
                }
            }
        }
    }

    /****************Publish************* */
    vm.addText = function () {

        //// Get the input value
        var inputValue = document.getElementById("textInput").value;

        // Check if the input is not empty
        if (inputValue.trim() !== "") {
            // Create a new list item
            var listItem = document.createElement("li");
            // Set the text content of the list item
            listItem.textContent = inputValue;
            // Append the new list item to the textList
            document.getElementById("textList").appendChild(listItem);
            // Clear the input field
            document.getElementById("textInput").value = "";
        }
    };
    vm.GetSelected = function () {
        var grid = document.getElementById("ServerTable");
        var checkBoxes = grid.getElementsByTagName("INPUT");
        for (var i = 0; i < checkBoxes.length; i++) {
            if (checkBoxes[i].checked) {
                var row = checkBoxes[i].parentNode.parentNode;
                document.getElementById("urlAddress").value = row.cells[0].innerHTML;
            }
        }
    }
    vm.GetSelectedNode = function () {

        var grid = document.getElementById("NodeTable");
        var checkBoxes = grid.getElementsByTagName("INPUT");
        var ds = vm.nodesList.Any(x => x.Selected == true);
        debugger;
        for (var i = 0; i < checkBoxes.length; i++) {
            if (checkBoxes[i].checked) {
                var row = checkBoxes[i].parentNode.parentNode;
                document.getElementById("selectNode").value = row.cells[1].innerText;
            }
        }
    }
    vm.checkConnection = function () {
        var result = document.getElementById("selectNode").value;
        if (result == "") {
            alert("Please select a node")
            return;
        }
        //var entrUrl = document.getElementById("urlAddress").value.trim(' ');
        //entrUrl = entrUrl.slice(0, -1);
        var listItems = document.querySelectorAll("#textList li");
        vm.success = [];
        if (listItems.length != 0) {
            listItems.forEach(function (item) {
                var uslTest = item.textContent.slice(0, -1);
                $http({
                    url: uslTest + apiUrl + "HeartBeat",
                    method: "GET",
                }).then(function (response) {
                    if (response.data == 1) {
                        vm.success.push({
                            Server: item.textContent,
                            Status: "Available",
                        });
                    }
                }).catch(error => {
                    console.error('Error:', error);
                    vm.success.push({
                        Server: item.textContent,
                        Status: "Not available",
                    });
                });
            });

            modal.style.display = "block";
        }
    };
    vm.exportData = function () {
        $http({
            url: "/Umbraco/CreateContent/ContentData/index",
            method: "GET",
            dataType: "json",
        }).then(function (response) {
            vm.alldata = response.data;
        }).catch(error => {
            msgErr.style.display = "block";
        });
    };
    vm.importData = function () {
        $http({
            url: "/Umbraco/ClaySync/CustomPublisherApi/importData",
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(Data)
        }).then(function (response) {
            $scope.users = response.data.data;
        }).catch(error => {
            msgErr.style.display = "block";
        });
    };
    vm.upDateValue = function () {

        var result = document.getElementById("selectNode").value;
       
        contentResource.getById(result)
            .then(function (data) {
                debugger;
                $scope.prop = data.variants[0].tabs[0].properties[1].value;
                var entrUrl = document.getElementById("urlAddress").value.trim(' ');
                entrUrl = entrUrl.slice(0, -1);
                var url = entrUrl + apiUrl + 'UpdateContent';

                $http({
                    url: url,
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify($scope.prop)
                }).then(function (response) {
                    msg.style.display = "block";
                }).catch(error => {
                    msgErr.style.display = "block";
                });
            });

    };
    vm.upDateImage = function () {
        $http({
            url: apiUrl + "ImageProcess",
            method: "GET",
            params: { "id": document.getElementById("selectNode").value }
        }).then(function (response) {
            debugger;
            vm.imageData = response.data;
            var entrUrl = document.getElementById("urlAddress").value.trim(' ');
            entrUrl = entrUrl.slice(0, -1);
            $http({
                url: entrUrl + apiUrl +"ImageUpdate",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                data: vm.imageData
            }).then(function (response) {
                msg.style.display = "block";
            }).catch(error => {
                debugger;
                msgErr.style.display = "block";
                msgErr.value = error;
            });

        });
    };
    vm.contentDetail = function () {
        $http({
            url: apiUrl + "CollectNodeDetail",
            method: "GET",
            params: { "id": document.getElementById("selectNode").value }
        }).then(function (response) {
            document.getElementById("textInput").value = response.data;
        }
        )};
});

