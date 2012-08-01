function autoRows(obj) {
            var Key = window.event.keyCode;
            var Cnt = EnterCount(obj);

            if (Key == 13) {
                if (Cnt > 5) {
                    obj.rows = obj.rows + 1;
                }
            } else if (Key == 8) {
                if (obj.rows > 8) {
                    obj.rows = obj.rows - 1;
                }
            }
        }

        function EnterCount(obj) {
            var entCount = 0;
            for (i = 0; i < obj.value.length; i++) {
                if (obj.value.charAt(i) == "\n") {
                    entCount++;
                }
            }
            return entCount;
        }
		function autoRows2(obj) {
            var Key = window.event.keyCode;
            var Cnt = EnterCount(obj);

            if (Key == 13) {
                if (Cnt > 8) {
                    obj.rows = obj.rows + 1;
                }
            } else if (Key == 8) {
                if (obj.rows > 8) {
                    obj.rows = obj.rows - 1;
                }
            }
        }

		function autoRows3(obj) {
            var Key = window.event.keyCode;
            var Cnt = EnterCount(obj);

            if (Key == 13) {
                if (Cnt > 5) {
                    obj.rows = obj.rows + 1;
                }
            } else if (Key == 8) {
                if (obj.rows >5) {
                    obj.rows = obj.rows - 1;
                }
            }
        }