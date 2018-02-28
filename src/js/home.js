var app = app || {};
!function () {
    "use strict";
    app.homeApp = Backbone.Model.extend({
        posters: [],
        relations: [],
        palettes: [],
        nodes: {},
        myView: "",
        initialize: function (e) {
            var t = this;
            $.ajax({
                type: "GET",
                crossDomain: !0,
                url: rootApiURL,
                data: {lang: e},
                dataType: "json",
                error: function () {
                },
                success: function (e) {
                    t.posters = e.posters, t.relations = e.relations, t.palettes = e.palettes, t.sanitizeData()
                }
            })
        },
        sanitizeData: function () {
            var e = this;
            $.each(e.posters, function (t, s) {
                var o = s.SHORTSLUG, i = JSON.parse(s.home_params), n = _.find(e.palettes, function (e) {
                    return e.id === s.PALETTE
                }), a = _.filter(e.relations, function (e) {
                    return e.poster_id_1 === s.id || e.poster_id_2 === s.id
                }), d = _.map(a, function (t) {
                    var o = t.poster_id_1;
                    t.poster_id_1 === s.id && (o = t.poster_id_2);
                    var i = _.find(e.posters, function (e) {
                        return e.id === o
                    });
                    return void 0 !== i ? [i.SHORTSLUG, Number(t.weight)] : void 0
                });
                e.nodes[o] = {}, e.nodes[o].id = o, e.nodes[o].label_position = i.label, e.nodes[o].center = i.center, e.nodes[o].color = "#" + n.defaultColor, e.nodes[o].paletteId = n.id, e.nodes[o].relations = _.without(d, void 0), e.nodes[o].isActive = "" !== s.JSON ? 1 : 0
            }), this.render()
        },
        render: function () {
            this.myView = new app.homeView({model: this})
        }
    })
}(jQuery);

!function (e) {
    "use strict";

    i18next.use(window.i18nextXHRBackend)
        .init({
            fallbackLng: LANG,
            debug: true,
            ns: ['translation', 'poster'],
            defaultNS: 'translation',
            backend: {
                // load from i18next-gitbook repo
                loadPath: 'locales/{{lng}}/{{ns}}.json',
                crossDomain: false
            }
        }, function(err, t) {
            // init set content
            updateContent();
        });

    function updateContent() {
        $("#Home").localize();
    }

    app.homeView = Backbone.View.extend({
        model: "",
        s: Snap("#TreeSVG"),
        selectedPoster: "",
        comparisonPoster: "",
        _legendTexts: {},
        _legendDisplayed: {clickNode: !1, clickLink: !1},
        _sBezierFactor: -100,
        _treeSize: {width: 500, height: 560},
        _nodeSize: {width: 80, height: 80},
        _defaultColor: "#ddd2cf",
        _defaultInputEmailValue: "",
        initialize: function (e) {

            jqueryI18next.init(i18next, $, {
                tName: 't', // --> appends $.t = i18next.t
                i18nName: 'i18n', // --> appends $.i18n = i18next
                handleName: 'localize', // --> appends $(selector).localize(opts);
                selectorAttr: 'data-i18n', // selector for translating elements
                targetAttr: 'i18n-target', // data-() attribute to grab target element to translate (if diffrent then itself)
                optionsAttr: 'i18n-options', // data-() attribute that contains options, will load/set if useOptionsAttr = true
                useOptionsAttr: false, // see optionsAttr
                parseDefaultValueFromContent: true // parses default values from content ele.val or ele.text
            });

            this.model = e.model, this._legendTexts = {
                clickNode: $.t("click_node"),
                clickLink: $.t("click_link")
            }, this._defaultInputEmailValue = $.t("enter_email"), this.generateNodes(), this.generateLinks(), this.initStyles(), this.bindEvents(), this.hideAll(), this.appear()
        },
        generateNodes: function () {
            e.each(this.model.nodes, function (t, s) {
                var o = e("<div class='tree_node tree_node--" + s.paletteId + "' data-poster='" + s.id + "'><span class='tree_node_label " + s.label_position + "' data-i18n='poster:" + s.id + ".NOM' ></span></div>");
                o.hover(function() {
                    $('#label_tooltip').attr("data-i18n", "poster:" + s.id + ".TOOLTIP");
                    $('.tooltiptext').css("background-color", s.color);
                    $('.tree_legend').css( "display", "none" );
                    $('.tooltiptext').toggle();
                    $("#label_tooltip").localize();
                }, function() {
                    $('.tooltiptext').toggle();
                });
                e(".tree_nodes").append(o);
            });
        },
        generateLinks: function () {
            var t = this;
            e.each(this.model.nodes, function (s, o) {
                var i = e(".tree_node[data-poster='" + o.id + "']").position();
                i.left = i.left + t._treeSize.width / 2 + t._nodeSize.width * o.center.left, i.top = i.top + t._treeSize.height / 2 + t._nodeSize.height * o.center.top, e.each(o.relations, function (s, n) {
                    var a = e(".tree_node[data-poster='" + n[0] + "']").position();
                    a.left = a.left + t._treeSize.width / 2 + t._nodeSize.width * t.model.nodes[n[0]].center.left, a.top = a.top + t._treeSize.height / 2 + t._nodeSize.height * t.model.nodes[n[0]].center.top;
                    var d = n[1];
                    t.drawLink(i, a, d, o.id, t.model.nodes[n[0]].id, o.color, t.model.nodes[n[0]].color)
                })
            })
        },
        drawLink: function (e, t, s, o, i, n, a) {
            var d = this, r = 100;
            e.top <= this._treeSize.height / 2 && (r = -100);
            var l = this.getCurvePath(e.left, t.left, e.top, t.top, r), c = this.s.path(l), h = "link--" + o + "--" + i,
                p = "", u = "";
            e.left > t.left ? (p = this.s.gradient("l(0, 1, 1, 1)" + a + "-" + n), u = this.s.gradient("l(0, 1, 1, 1)" + this._defaultColor + "-" + n)) : e.left < t.left ? (p = this.s.gradient("l(0, 1, 1, 1)" + n + "-" + a), u = this.s.gradient("l(0, 1, 1, 1)" + n + "-" + this._defaultColor)) : e.top > t.top ? (p = this.s.gradient("l(0,0,0,1)" + a + "-" + n), u = this.s.gradient("l(0, 0, 0, 1)" + this._defaultColor + "-" + n)) : (p = this.s.gradient("l(0,0,0,1)" + n + "-" + a), u = this.s.gradient("l(0, 0, 0, 1)" + n + "-" + this._defaultColor)), p.attr({id: "gradient_" + h}), u.attr({id: "defaultGradient_" + h});
            var m = (Math.sqrt(Math.pow(t.left - e.left, 2) + Math.pow(t.top - e.top, 2)), 400);
            c.attr({
                id: h,
                fill: "none",
                cursor: "pointer",
                stroke: n,
                "stroke-width": 2 * s,
                "stroke-dasharray": m,
                "stroke-dashoffset": m,
                "stroke-opacity": .6
            }).mouseover(function () {
                d.hoverSVGLink(this)
            }).mouseout(function () {
                d.outSVGLink(this)
            }).click(function () {
                d.clickSVGLink(this)
            }), c.addClass(o).addClass("hiddenPath").attr("data-dashsize", m)
        },
        hoverSVGLink: function (e) {
            this.s.selectAll("path:not(.selected)").attr({"stroke-opacity": .6}), e.attr({"stroke-opacity": 1})
        },
        outSVGLink: function (e) {
            e.hasClass("selected") || e.attr({"stroke-opacity": .6})
        },
        clickSVGLink: function (t) {
            this.updateLegendLink();
            var s = t.node.id.split("--")[1];
            if (this.s.selectAll("path").attr({"stroke-opacity": .6}), t.toFront(), t.hasClass("selected")) e("path").removeClass("selected"), this.resetComparison(t); else {
                e("path").removeClass("selected");
                var o = t.node.id.split("--")[2], i = "gradient_" + t.node.id;
                e(".tree_node").removeClass("compared"), e(".tree_node--" + o).addClass("compared"), e(".tree_node:not(.compared):not(.selected)").addClass("notcompared");
                var n = this.s.selectAll("path." + s);
                e.each(n, function (e, t) {
                    var s = "defaultGradient_" + t.node.id;
                    t.attr({stroke: "url('#" + s + "')", "stroke-opacity": 1})
                }), t.attr({stroke: "url('#" + i + "')"}).addClass("selected"), this.comparisonPoster = o, this.updateDisclaimerComparison()
            }
        },
        resetComparison: function (t) {
            e(".shareblock").removeClass("toback");
            var s = t.node.id.split("--")[1], o = this.model.nodes[s].color;
            t.removeClass("selected"), e(".tree_node").removeClass("compared").removeClass("notcompared"), this.s.selectAll("path." + s).attr({stroke: o}), this.updateDisclaimerThemed()
        },
        getCurvePath: function (e, t, s, o, i) {
            var n = e + (t - e) / 2 + 1, a = s - i;
            return n = 250, a = 280, "M" + (e - .1) + "," + (s - .1) + "Q" + n + "," + a + " " + t + "," + o
        },
        initStyles: function () {
            e(".disclaimer_content_inner[data-step='default']").addClass("displayed")
        },
        bindEvents: function () {
            var t = this;
            e(".tree_nodes").on("click touch", ".tree_node", function () {
                t.selectNode(e(this)), t.updateLegendNode()
            }), e(".comparison_close").on("click", function () {
                t.resetComparison(t.s.select("#link--" + t.selectedPoster + "--" + t.comparisonPoster))
            }), e(".about--link").on("click", function () {
                e(this).hasClass("displayed") ? t.hideAbout() : t.displayAbout()
            }), e(".aboutblock_close").on("click", function () {
                t.hideAbout()
            }), e(".languages").on("click", function () {
                location.href = "fr" === LANG ? location.protocol + "//" + location.host + location.pathname + "?lang=en" : location.protocol + "//" + location.host + location.pathname + "?lang=fr"
            }), e("#user_getintouch_field").on("focus", function (s) {
                var o = e(s.target);
                o.val() === t._defaultInputEmailValue && o.val("")
            }), e(".user_getintouch_bt").on("click", function () {
                e(".user_getintouch_bt").hide(), e(".user_getintouch_result").text(""), e.ajax({
                    type: "POST",
                    crossDomain: !0,
                    url: rootApiURL + "getintouch",
                    dataType: "json",
                    data: {user_getintouch_field: e("#user_getintouch_field").val()},
                    error: function () {
                        e(".user_getintouch_result").text("Une erreur est survenue")
                    },
                    success: function (t) {
                        var s = "";
                        switch (t.output.text) {
                            case"invalid_email":
                                s = "L'email n'est pas valide";
                                break;
                            case"error_db":
                                s = "Une erreur est survenue";
                                break;
                            case"email_exist":
                                s = "L'email est déjà enregistré";
                                break;
                            case"email_recorded":
                                s = "Merci, votre email est bien enregistré"
                        }
                        e(".user_getintouch_result").text(s), e(".user_getintouch_bt").show()
                    }
                })
            })
        },
        selectNode: function (t) {
            var s = this;
            e(".tree_node").removeClass("compared").removeClass("notcompared"), t.hasClass("selected") ? (this.hideLinks(t.attr("data-poster")), t.removeClass("selected"), e(".tree_legend").removeClass("persistent"), s.selectedPoster = "", s.resetDisclaimer()) : s.displayLinks(t.attr("data-poster"))
        },
        hideAll: function () {
            e(".hideable").addClass("hidden")
        },
        appear: function () {
            var t = this;
            setTimeout(function () {
                e(".tree_nodes").removeClass("hidden")
            }, 50), setTimeout(function () {
                e(".spiderweb").removeClass("hidden")
            }, 2300), setTimeout(function () {
                e(".disclaimer_content").removeClass("hidden")
            }, 2800), setTimeout(function () {
                e(".shareblock_logo").removeClass("hidden")
            }, 3200), setTimeout(function () {
                e(".shareblock_links").removeClass("hidden"), e("#Header").removeClass("hidden"), e("#Footer").removeClass("hidden"), e(".treesvg_container").removeClass("hidden")
            }, 3600), setTimeout(function () {
                t.updateLegendNode()
            }, 4600)
        },
        updateLegendNode: function () {
            this._legendDisplayed.clickNode ? this.updateLegendLink() : (e("#click_node").removeClass("hidden"), this._legendDisplayed.clickNode = !0)
        },
        updateLegendLink: function () {
            this._legendDisplayed.clickLink ? e("#click_link").addClass("hidden") : (e("#click_link").removeClass("hidden"), this._legendDisplayed.clickLink = !0)
        },
        displayLinks: function (t) {
            var s = this;
            e(".shareblock").addClass("toback"), e(".tree_node").removeClass("selected"), e(".tree_node[data-poster='" + t + "']").addClass("selected"), "" !== this.selectedPoster && this.hideLinks(this.selectedPoster), this.selectedPoster = t, e.each(e("path." + t), function (t, o) {
                var i = e(o).attr("id");
                s.s.select("#" + i).removeClass("hiddenPath")
            }), this.s.selectAll("path." + t).animate({"stroke-dashoffset": 0}, 300, mina.easeout), e(".spiderweb").addClass("hidden"), this.updateDisclaimerThemed()
        },
        hideLinks: function (t) {
            var s = this;
            e(".spiderweb").removeClass("hidden"), e.each(e("path." + t), function (o, i) {
                var n = e(i).attr("id"), a = e(i).attr("data-dashsize");
                s.s.select("#" + n).animate({"stroke-dashoffset": a}, 300, mina.easeout).attr({stroke: s.model.nodes[t].color}), setTimeout(function () {
                    s.s.select("#" + n).addClass("hiddenPath")
                }, 350)
            })
        },
        updateDisclaimerThemed: function () {
            e(".disclaimer_content_inner[data-step='themed'] .disclaimer_theme")
                .attr("data-i18n", "poster:" + this.selectedPoster + ".NOM")
                //.html(this.model.nodes[this.selectedPoster].name)
                .css("color", this.model.nodes[this.selectedPoster].color)
            , e(".disclaimer_content_inner[data-step='themed'] .disclaimer_content_subtitle")
                .attr("data-i18n", "poster:" + this.selectedPoster + ".SUBTITLE") //  this.model.nodes[this.selectedPoster].subtitle)
                .css("color", this.model.nodes[this.selectedPoster].color)
            , e(".disclaimer_content_inner[data-step='themed'] .disclaimer_content_text")
                .attr("data-i18n", "[html]poster:" + this.selectedPoster + ".desc")
                //.html($.t("poster:"+this.selectedPoster+".desc")) // this.model.nodes[this.selectedPoster]["text" + LANG])
            , e(".disclaimer_content_inner")
                .removeClass("displayed")
            , e(".disclaimer_content_inner[data-step='themed']")
                .addClass("displayed")
            , 1 === this.model.nodes[this.selectedPoster].isActive ? (e(".disclaimer_link").css("background-color", this.model.nodes[this.selectedPoster].color)
                .css("display", "block")
                .attr("href", "posters#" + this.model.nodes[this.selectedPoster].id)
            , e(".disclaimer_block")
                .css("display", "none")) : (e(".disclaimer_block").css("color", this.model.nodes[this.selectedPoster].color).css("display", "block"), e(".disclaimer_link")
                .css("display", "none"));
            $("#Home").localize();
        },
        updateDisclaimerComparison: function () {
            e(".shareblock").addClass("toback"), e(".disclaimer_content_inner[data-step='comparison'] .disclaimer_theme").attr("data-i18n", "poster:" + this.selectedPoster + ".NOM").css("color", this.model.nodes[this.selectedPoster].color), e(".comparison_title").html("... " + $.t("and") + " " + $.t("poster:" + this.comparisonPoster + ".NOM")).css("color", this.model.nodes[this.comparisonPoster].color), console.log(this.selectedPoster, this.comparisonPoster);
            var t = this.getPosterIdFromShortslug(this.selectedPoster),
                s = this.getPosterIdFromShortslug(this.comparisonPoster);
            console.log(t, s);
            var o = _.find(app.myHome.relations, function (e) {
                return !(e.poster_id_1 !== t && e.poster_id_1 !== s || e.poster_id_2 !== t && e.poster_id_2 !== s)
            });
            e(".comparison_text").html(o.description), e(".disclaimer_content_inner").removeClass("displayed"), e(".disclaimer_content_inner[data-step='comparison']").addClass("displayed");
            $("#Home").localize();
        },
        getPosterIdFromShortslug: function (e) {
            return _.find(app.myHome.posters, function (t) {
                return t.SHORTSLUG === e
            })["id"]
        },
        resetDisclaimer: function () {
            e(".shareblock").removeClass("toback"), e(".disclaimer_content_inner").removeClass("displayed"), e(".disclaimer_content_inner[data-step='default']").addClass("displayed")
        },
        displayAbout: function () {
            e(".shareblock").addClass("toback"), e(".aboutblock").addClass("displayed")
        },
        hideAbout: function () {
            e(".shareblock").removeClass("toback"), e(".aboutblock").removeClass("displayed")
        }
    })
}(jQuery);