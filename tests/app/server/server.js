/**
 * server.js
 */
const fs = require('fs');
const path = require('path');
const utils79 = require('utils79');
const express = require('express'),
	app = express();
const server = require('http').Server(app);
const bodyParser = require('body-parser');

app.use( bodyParser({"limit": "1024mb"}) );
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.use( '/common/dist/', express.static( path.resolve(__dirname, '../../../dist/') ) );
app.use( '/apis/git', function(req, res, next){

	var cmdAry = req.body.cmdAry;

	var stdout = '';
	var _pathCurrentDir = process.cwd();
	var _pathGitDir = require('path').resolve(__dirname+'/../../data/');
	// console.log(_pathGitDir);
	process.chdir( _pathGitDir );

	var proc = require('child_process').spawn('git', cmdAry);
	proc.stdout.on('data', function(data){
		stdout += data;
	});
	proc.stderr.on('data', function(data){
		stdout += data; // エラー出力も stdout に混ぜて送る
	});
	proc.on('close', function(code){
		res.send(JSON.stringify({
			code: code,
			stdout: stdout
		}));
	});

	process.chdir( _pathCurrentDir );
	return;
} );

app.use( express.static( __dirname+'/../client/' ) );

// 8080番ポートでLISTEN状態にする
server.listen( 8080, function(){
	console.log('server-standby');
} );
