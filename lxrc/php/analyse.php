<?php

	$resources = $_POST['res'];
	$res  = '';

	//输出信息
	$END = ';';
	$out = '<script>';
	$out .= 'window.datas = {}'.$END;

	//尝试解析;
	try {
		$string = urldecode($resources);
		$res = json_decode($string);
		if($res)
			foreach ($res as $key => $value) {
				$len = count($value);
				if( $key == "resources" ){
					$out .= "window.datas.resources = new Array()".$END;
					for ($i=0; $i < $len; $i++) { 
						$out .= "window.datas.$key [$i] =" .json_encode($value[$i]) .$END;
						//$out .='1'.$END;
					}
				}
				else {
					$out .= "window.datas.$key = ".$value.$END;
				}
				
			}
		else
			$out .= "window.datas.resources = new Array();window.datas.listNum=0".$END;	
	} catch (Exception $e) {
		$out .= "window.datas.resources = new Array();window.datas.listNum=0".$END;
	}

	

	$out .= "console.log(datas.listNum)".$END;
	$out .= '</script>';	//end output;

	//本地
	$d = file_get_contents("./index.html");
	//线上
	//$d = file_get_contents("http://vod.xunlei.com/page/extension/index.html");
	$pattern = '<script type="text/javascript" id="__DataSourceScript__"></script>';
	$d = str_replace($pattern, $out, $d);
	print_r($d);

/**

<script>
window.datas.resources = new Array();
window.datas.resources[0] = {id:'xxx',url:'xxx'};
window.datas.resources[1] = {id:'xxx',url:'xxx'};
window.datas.resources[2] = {id:'xxx',url:'xxx'};
window.datas.resources[3] = {id:'xxx',url:'xxx'};
window.datas.listNum=4;
</script>


res:{
	time:int,
	listNum: 4,
  resources : [
  	{id:'xx', url:'xxx'}
  	{id:'xx', url:'xxx'}
  	{id:'xx', url:'xxx'}
  	{id:'xx', url:'xxx'}
  ]
}
*/
?>


