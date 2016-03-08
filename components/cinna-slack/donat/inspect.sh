echo "select count(*) from error_tbl;" | sqlite3 `ls *.db |tail -n 1`
echo "select count(distinct item) from product_tbl;" | sqlite3 `ls *.db |tail -n 1`
echo "select * from error_tbl limit 35;" | sqlite3 `ls *.db |tail -n 1`
