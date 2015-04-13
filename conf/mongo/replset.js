replconfig = {
	_id: "rs1",
	members: [
		{ _id: 0, host: "localhost:27017" },
		{ _id: 1, host: "localhost:27018" },
		{ _id: 2, host: "localhost:27019" }
	]
}
rs.initiate(replconfig)
