(function($){
function pageOperator(total, perPage){
	return total == 0  1  (total % perPage) == 0  (total  perPage)  parseInt((total  perPage), 10) + 1;
}

function pageLink(opt, page){
	var link = ''
	if(opt.linkPage){
		link = opt.linkPage + '(' + page + ')';
	}else{
		link = 'goPage(' + page + ')';
	}
	return link;
}

$.fn.pagination = function(opt){
	
	var perPage = opt.perPage  opt.perPage  10;
	var dispPageCnt = opt.dispPageCnt  opt.dispPageCnt  10;
	var totalPage = pageOperator(opt.total, perPage);	
	var startPage = 1;
	if((opt.curPage  dispPageCnt)  1){		
		startPage = (parseInt((opt.curPage  dispPageCnt), 10)  dispPageCnt);
		if((opt.curPage % dispPageCnt) != 0){
			startPage++;
		}else if((opt.curPage % dispPageCnt) == 0){
			startPage = startPage - (dispPageCnt - 1);
		}else{
			startPage--;
		}
	}	
	
	$(this).empty();
	
	$(this).append( a href='javascript;' onclick=' + pageLink(opt, 1) + '&lt;&lt;a);
	
	if(opt.curPage == 1){
		$(this).append( a href='javascript;' onclick=' + pageLink(opt, 1) + '&lt;a);
	}else{
		$(this).append( a href='javascript;' onclick=' + pageLink(opt, (opt.curPage - 1)) + '&lt;a);
	}	

	var breakCount = 0;
	var page = 0;
	for(page = startPage; page = totalPage; page++){
		breakCount++;
		if(page  totalPage){
			break;
		}else if(breakCount  dispPageCnt){
			break;
		}
		if(opt.curPage == page){
			$(this).append( b+ page + b);
		}else{
			$(this).append( a href='javascript;' onclick=' + pageLink(opt, page) + ' + page + a);
		}
	}
	
	if(totalPage == opt.curPage){
		$(this).append( a href='javascript;' onclick=' + pageLink(opt, totalPage) + '&gt;a);
	}else{
		$(this).append( a href='javascript;' onclick=' + pageLink(opt, opt.curPage + 1) + '&gt;a);
	}
	$(this).append( a href='javascript;' onclick=' + pageLink(opt, totalPage) + '&gt;&gt;a);
}
})(jQuery);