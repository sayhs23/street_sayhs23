
        /** 비디오 검색. **/
        var daumVclip = {
            /** 초기화. **/
            init: function (r) {
                daumVclip.api = 'http://apis.daum.net/search/vclip';
                daumVclip.pgno = 1;
                daumVclip.result = r;
            },
            /** callback 함수 호출. **/
            pingSearch: function (pgno) {
                daumVclip.pgno = pgno;

                var ds = document.getElementById('daumVclipScript');
                var callback = 'daumVclip.pongSearch';

                daumSearch.pingSearch(ds, daumVclip.api, daumVclip.pgno,
                callback, daumVclip.result);
            },
            /** 결과를 뿌려줌. **/
            pongSearch: function (z) {
                var dv = document.getElementById('daumVclip');
                dv.innerHTML = "";
                dv.appendChild(daumSearch.pongSearch(this, z));
                dv.appendChild(daumSearch.pongPgno(daumVclip.pgno,
                z.channel.totalCount / daumVclip.result, daumVclip.pingSearch));
            },
            /** li setting **/
            getSearch: function (title, content) {
                var li = document.createElement('li');
                li.style.height = "230px";
                li.style.width = '150px';
                li.style.float = 'left';

                content.appendChild(document.createElement('br'));
                li.appendChild(content);
                li.appendChild(title);

                return li;
            },
            /** 설명 return **/
            getContent: function (z) {
                var a = document.createElement('a');
                var img = document.createElement('img');

                a.target = '_blank';
                a.href = z.player_url;

                img.height = 100;
                img.width = 100;
                img.src = z.thumbnail;

                a.appendChild(img);

                return a;
            }
        };

        var daumSearch = {
            /** 초기화. **/
            init: function () {
                this.apikey = "DAUM_SEARCH_DEMO_APIKEY";
                this.q = document.getElementById('daumSearch');

                //검색 객체들 초기화.
                daumVclip.init(6);
                daumImage.init(6);
                daumBoard.init(5);
                daumBlog.init(5);
                daumWeb.init(5);
                daumKnowledge.init(5);
                daumCafe.init(5);
            },
            /** 검색 **/
            search: function () {
                this.query = '?apikey=' + this.apikey
                + '&output=json&q=' + encodeURI(this.q.value);

                //검색어에 맞게 각각 첫페이지를 띄움.
                daumVclip.pingSearch(1);
                daumImage.pingSearch(1);
                daumBoard.pingSearch(1);
                daumBlog.pingSearch(1);
                daumWeb.pingSearch(1);
                daumKnowledge.pingSearch(1);
                daumCafe.pingSearch(1);
            },
            searchVclip: function() {
				this.query = '?apikey=' + this.apikey
                + '&output=json&q=' + encodeURI(this.q.value);
               daumVclip.pingSearch(1);

			},
            searchImage: function() {
				this.query = '?apikey=' + this.apikey
                + '&output=json&q=' + encodeURI(this.q.value);
               daumImage.pingSearch(1);

			},
            searchBoard: function() {
				this.query = '?apikey=' + this.apikey
                + '&output=json&q=' + encodeURI(this.q.value);
               daumBoard.pingSearch(1);

			},
            searchBlog: function() {
				this.query = '?apikey=' + this.apikey
                + '&output=json&q=' + encodeURI(this.q.value);
               daumBlog.pingSearch(1);

			},
            searchWeb: function() {
				this.query = '?apikey=' + this.apikey
                + '&output=json&q=' + encodeURI(this.q.value);
               daumWeb.pingSearch(1);

			},
            searchKnowledge: function() {
				this.query = '?apikey=' + this.apikey
                + '&output=json&q=' + encodeURI(this.q.value);
               daumKnowledge.pingSearch(1);

			},
		    searchCafe: function() {
				this.query = '?apikey=' + this.apikey
                + '&output=json&q=' + encodeURI(this.q.value);
               daumCafe.pingSearch(1);

			},
            /** callback 함수 호출. **/
            pingSearch: function (ds, api, pgno, callback, result) {
                ds.innerHTML = "";

                var s = document.createElement('script');
                s.type = 'text/javascript';
                s.charset = 'utf-8';
                s.src = api + this.query + '&pageno=' + pgno
                + '&callback=' + callback + '&result=' + result;

                ds.appendChild(s);
            },
            /** 결과를 뿌려줌. **/
            pongSearch: function (search, z) {
                var ul = document.createElement('ul');

                for (var i = 0; i < z.channel.item.length; i++) {
                    //title 정보를 얻음.
                    var title = document.createElement('h3');
                    var a = document.createElement('a');
                    a.href = z.channel.item[i].link;
                    a.target = '_blank';
                    a.innerHTML = this.escapeHtml(z.channel.item[i].title);

                    title.appendChild(a);

                    //세부 내용을 얻음.
                    var content = search.getContent(z.channel.item[i]);

                    //리스트 화.
                    ul.appendChild(search.getSearch(title, content));
                }
                return ul;
            },
            /** PageNumber를 그려줌. **/
            pongPgno: function (pgno, max, func) {
                var maxpg = (pgno + 6 < max) ? pgno + 6 : max;

                var div = document.createElement('div');
                div.align = 'center';
                div.style.clear = 'left';

                //좌측 화살표.
                var left = document.createElement('a');
                left.innerHTML = "<< ";
                if (pgno - 5 > 1)
                    this.onMouseDown(left, pgno - 6, func);
                else {
                    left.style.color = "gray";
                    left.style.cursor = "default";
                }
                div.appendChild(left);

                //페이지 번호.
                for (var i = (pgno - 5 > 1) ? pgno - 5 : 1; i < maxpg; i++) {
                    var a = document.createElement('a');
                    a.innerHTML = " " + i + " ";

                    if (i == pgno) {
                        a.style.color = 'yellow';
                        a.style.cursor = "default";
                    }
                    else
                        this.onMouseDown(a, i, func);

                    div.appendChild(a);
                }

                //우측 화살표.
                var right = document.createElement('a');
                right.innerHTML = ">> ";
                if (pgno + 6 < max)
                    this.onMouseDown(right, pgno + 7, func);
                else {
                    right.style.color = "gray";
                    right.style.cursor = "default";
                }
                div.appendChild(right);

                return div;
            },
            /** 마우스 이벤트. **/
            onMouseDown: function (a, i, func) {
                a.style.cursor = 'pointer';
                a.onmousedown = function () {
                    func(i);
                }
            },
            /** HTML태그 안 먹게 하는 함수 **/
            escapeHtml: function (str) {
                strstr = str.replace(/&amp;/g, "&");
                strstr = str.replace(/&lt;/g, "<");
                strstr = str.replace(/&gt;/g, ">");
                return str;
            }
        };

        window.onload = function () {
            daumSearch.init();
            daumSearch.search();
        };

    /** 이미지 검색. **/
    var daumImage = {
        /** 초기화. **/
        init: function (r) {
            daumImage.api = 'http://apis.daum.net/search/image';
            daumImage.pgno = 1;
            daumImage.result = r;
        },
        /** callback 함수 호출. **/
        pingSearch: function (pgno) {
            daumImage.pgno = pgno;

            var ds = document.getElementById('daumImageScript');
            var callback = 'daumImage.pongSearch';

            daumSearch.pingSearch(ds, daumImage.api,
                daumImage.pgno, callback, daumImage.result);
        },
        /** 결과를 뿌려줌. **/
        pongSearch: function (z) {
            var dv = document.getElementById('daumImage');
            dv.innerHTML = "";
            dv.appendChild(daumSearch.pongSearch(this, z));
            dv.appendChild(daumSearch.pongPgno(daumImage.pgno,
                z.channel.totalCount / daumImage.result, daumImage.pingSearch));
        },
        /** li setting **/
        getSearch: function (title, content) {
            var li = document.createElement('li');
            li.style.height = "170px";
            li.style.width = '150px';
            li.style.float = 'left';

            content.appendChild(document.createElement('br'));
            li.appendChild(content);
            li.appendChild(title);

            return li;
        },
        /** 설명 return **/
        getContent: function (z) {
            var a = document.createElement('a');
            var img = document.createElement('img');

            a.target = '_blank';
            a.href = z.image;

            img.height = 100;
            img.width = 100;
            img.src = z.thumbnail;

            a.appendChild(img);

            return a;
        }
    };

        /** 게시판 검색. **/
        var daumBoard = {
            /** 초기화. **/
            init: function (r) {
                daumBoard.api = 'http://apis.daum.net/search/board';
                daumBoard.pgno = 1;
                daumBoard.result = r;
            },
            /** callback 함수 호출. **/
            pingSearch: function (pgno) {
                daumBoard.pgno = pgno;

                var ds = document.getElementById('daumBoardScript');
                var callback = 'daumBoard.pongSearch';

                daumSearch.pingSearch(ds, daumBoard.api, daumBoard.pgno,
                callback, daumBoard.result);
            },
            /** 결과를 뿌려줌. **/
            pongSearch: function (z) {
                var dv = document.getElementById('daumBoard');
                dv.innerHTML = "";
                dv.appendChild(daumSearch.pongSearch(this, z));
                dv.appendChild(daumSearch.pongPgno(daumBoard.pgno,
                z.channel.totalCount / daumBoard.result, daumBoard.pingSearch));
            },
            /** li setting **/
            getSearch: function (title, content) {
                var li = document.createElement('li');

                li.appendChild(title);
                li.appendChild(content);

                return li;
            },
            /** 설명 return **/
            getContent: function (z) {
                var a = document.createElement('a');

                a.target = '_blank';
                a.href = z.link;
                a.innerHTML = daumSearch.escapeHtml(z.description)

                return a;
            }
        };

        /** 블로그 검색. **/
        var daumBlog = {
            /** 초기화. **/
            init: function (r) {
                daumBlog.api = 'http://apis.daum.net/search/blog';
                daumBlog.pgno = 1;
                daumBlog.result = r;
            },
            /** callback 함수 호출. **/
            pingSearch: function (pgno) {
                daumBlog.pgno = pgno;

                var ds = document.getElementById('daumBlogScript');
                var callback = 'daumBlog.pongSearch';

                daumSearch.pingSearch(ds, daumBlog.api, daumBlog.pgno,
                callback, daumBlog.result);
            },
            /** 결과를 뿌려줌. **/
            pongSearch: function (z) {
                var dv = document.getElementById('daumBlog');
                dv.innerHTML = "";
                dv.appendChild(daumSearch.pongSearch(this, z));
                dv.appendChild(daumSearch.pongPgno(daumBlog.pgno,
                z.channel.totalCount / daumBlog.result, daumBlog.pingSearch));
            },
            /** li setting **/
            getSearch: function (title, content) {
                var li = document.createElement('li');

                li.appendChild(title);
                li.appendChild(content);

                return li;
            },
            /** 설명 return **/
            getContent: function (z) {
                var a = document.createElement('a');

                a.target = '_blank';
                a.href = z.link;
                a.innerHTML = daumSearch.escapeHtml(z.description);

                return a;
            }
        };

        /** 웹 검색. **/
        var daumWeb = {
            /** 초기화. **/
            init: function (r) {
                daumWeb.api = 'http://apis.daum.net/search/web';
                daumWeb.pgno = 1;
                daumWeb.result = r;
            },
            /** callback 함수 호출. **/
            pingSearch: function (pgno) {
                daumWeb.pgno = pgno;

                var ds = document.getElementById('daumWebScript');
                var callback = 'daumWeb.pongSearch';

                daumSearch.pingSearch(ds, daumWeb.api, daumWeb.pgno,
                callback, daumWeb.result);
            },
            /** 결과를 뿌려줌. **/
            pongSearch: function (z) {
                var dv = document.getElementById('daumWeb');
                dv.innerHTML = "";
                dv.appendChild(daumSearch.pongSearch(this, z));
                dv.appendChild(daumSearch.pongPgno(daumWeb.pgno,
                z.channel.totalCount / daumWeb.result, daumWeb.pingSearch));
            },
            /** li setting **/
            getSearch: function (title, content) {
                var li = document.createElement('li');

                li.appendChild(title);
                li.appendChild(content);

                return li;
            },
            /** 설명 return **/
            getContent: function (z) {
                var a = document.createElement('a');

                a.target = '_blank';
                a.href = z.link;
                a.innerHTML = daumSearch.escapeHtml(z.description);

                return a;
            }
        };

        /** 지식 검색. **/
        var daumKnowledge = {
            /** 초기화. **/
            init: function (r) {
                daumKnowledge.api = 'http://apis.daum.net/search/knowledge';
                daumKnowledge.pgno = 1;
                daumKnowledge.result = r;
            },
            /** callback 함수 호출. **/
            pingSearch: function (pgno) {
                daumKnowledge.pgno = pgno;

                var ds = document.getElementById('daumKnowledgeScript');
                var callback = 'daumKnowledge.pongSearch';

                daumSearch.pingSearch(ds, daumKnowledge.api, daumKnowledge.pgno,
                callback, daumKnowledge.result);
            },
            /** 결과를 뿌려줌. **/
            pongSearch: function (z) {
                var dv = document.getElementById('daumKnowledge');
                dv.innerHTML = "";
                dv.appendChild(daumSearch.pongSearch(this, z));
                dv.appendChild(daumSearch.pongPgno(daumKnowledge.pgno,
            z.channel.totalCount / daumKnowledge.result, daumKnowledge.pingSearch));
            },
            /** li setting **/
            getSearch: function (title, content) {
                var li = document.createElement('li');

                li.appendChild(title);
                li.appendChild(content);

                return li;
            },
            /** 설명 return **/
            getContent: function (z) {
                var div = document.createElement('div');
                var a = document.createElement('a');
                var b = document.createElement('b');
                var ba = document.createElement('a');

                a.target = '_blank';
                a.href = z.link;
                a.innerHTML = daumSearch.escapeHtml(z.description) + '<br' + '>';

                ba.target = '_blank';
                ba.href = z.categoryurl;
                ba.innerHTML = daumSearch.escapeHtml(z.category);

                b.appendChild(ba);

                div.appendChild(a);
                div.appendChild(b);

                return div;
            }
        };

    /** 카페 검색. **/
    var daumCafe = {
        /** 초기화. **/
        init: function (r) {
            daumCafe.api = 'http://apis.daum.net/search/cafe';
            daumCafe.pgno = 1;
            daumCafe.result = r;
        },
        /** callback 함수 호출. **/
        pingSearch: function (pgno) {
            daumCafe.pgno = pgno;

            var ds = document.getElementById('daumCafeScript');
            var callback = 'daumCafe.pongSearch';

            daumSearch.pingSearch(ds, daumCafe.api, daumCafe.pgno,
                callback, daumCafe.result);
        },
        /** 결과를 뿌려줌. **/
        pongSearch: function (z) {
            var dv = document.getElementById('daumCafe');
            dv.innerHTML = "";
            dv.appendChild(daumSearch.pongSearch(this, z));
            dv.appendChild(daumSearch.pongPgno(daumCafe.pgno,
                z.channel.totalCount / daumCafe.result, daumCafe.pingSearch));
        },
        /** li setting **/
        getSearch: function (title, content) {
            var li = document.createElement('li');

            li.appendChild(title);
            li.appendChild(content);

            return li;
        },
        /** 설명 return **/
        getContent: function (z) {
            var div = document.createElement('div');
            var a = document.createElement('a');
            var b = document.createElement('b');
            var ba = document.createElement('a');

            a.target = '_blank';
            a.href = z.link;
            a.innerHTML = daumSearch.escapeHtml(z.description) + '<' + 'br/>';

            ba.target = '_blank';
            ba.href = z.cafeurl;
            ba.innerHTML = daumSearch.escapeHtml(z.cafeName);

            b.appendChild(ba);

            div.appendChild(a);
            div.appendChild(b);

            return div;
        }
    };