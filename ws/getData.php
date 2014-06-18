<?php
include("database.php");

$con=mysqli_connect($database_host,$database_user,$database_password,$database_schema,3306);
// Check connection
if (mysqli_connect_errno()) {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
}

$j = array();
$high_injury = 0;

if(isset($_GET['q']) && isset($_GET['p'])) {
	$q = $_GET['q'];
	$p = $_GET['p'];

	if($q == "county") {

	}

	$query = sprintf("SELECT * FROM data WHERE %s='%s' order by date asc",
            mysqli_real_escape_string($con, $q),
            mysqli_real_escape_string($con, $p));

	$result = mysqli_query($con,$query);

	
	while($row = mysqli_fetch_array($result)) {

		$d = "";
		if(strpos($row['property_damage'], 'K')) {
			$d = substr($row['property_damage'],0,strpos($row['property_damage'], 'K'));
			$d = substr($d,0,strpos($d,"."));
			$d .= "000";
			$d = intval($d);
		} else {
			$d = substr($row['property_damage'],0,strpos($row['property_damage'], 'M'));
			$d = substr($d,0,strpos($d,"."));
			$d .= "000000";
			$d = intval($d);
		}
		if(intval($row['deaths']) + intval($row['injuries']) > $high_injury) {
			$high_injury = intval($row['deaths']) + intval($row['injuries']);
		}
	  array_push($j, array("location" => $row['location'], 
	  	"county" => $row['county'],
	  	"time" => strtotime($row['date']),
	  	"date" => $row['date'],
	  	"type" => $row['type'],
	  	"mag" => $row['mag'],
	  	"deaths" => $row['deaths'],
	  	"injuries" => $row['injuries'],
	  	"damage" => $d,
	  	'id' => $row['iddata'],
	  	"state" => $row['state'],));
	}


} else {
	$query = "SELECT * FROM data where injuries > 0 or deaths > 0 or property_damage != '0.00K' order by date asc";

	$result = mysqli_query($con,$query);

	while($row = mysqli_fetch_array($result)) {

		$d = "";
		if(strpos($row['property_damage'], 'K')) {
			$d = substr($row['property_damage'],0,strpos($row['property_damage'], 'K'));
			$d = substr($d,0,strpos($d,"."));
			$d .= "000";
			$d = intval($d);
		} else {
			$d = substr($row['property_damage'],0,strpos($row['property_damage'], 'M'));
			$d = substr($d,0,strpos($d,"."));
			$d .= "000000";
			$d = intval($d);
		}
		if(intval($row['deaths']) + intval($row['injuries']) > $high_injury) {
			$high_injury = intval($row['deaths']) + intval($row['injuries']);
		}

	  array_push($j, array("location" => $row['location'], 
	  	"county" => $row['county'],
	  	"time" => strtotime($row['date']),
	  	"date" => $row['date'],
	  	"type" => $row['type'],
	  	"mag" => $row['mag'],
	  	"deaths" => $row['deaths'],
	  	"injuries" => $row['injuries'],
	  	"damage" => $d,
	  	'id' => $row['iddata'],
	  	"state" => $row['state'],));
	}
}

echo json_encode(array("data" => $j, "max" => $high_injury));

?>