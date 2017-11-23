
var path = require('path');
var config = require(path.join(__dirname, '../','/config.json'));
var CORS = require('../ultilities/CORSRequest');
var fetch = require('node-fetch')
const FirebaseConstants = config.FirebaseConstants
const FirebaseAPI_URL = {
	MANAGING_DEVICE_GROUPS : "https://android.googleapis.com/gcm/notification",
	MANAGING_SEND_MESSAGE : "https://fcm.googleapis.com/fcm/send"
}
const custom_headers = new fetch.Headers()
custom_headers.append('Content-Type', 'application/json')
custom_headers.append('Authorization',"key=" + FirebaseConstants.KEY)
custom_headers.append("project_id", FirebaseConstants.SENDER_ID)
module.exports.send = function(body, type) {
		if (FirebaseConstants.KEY === 'YOUR_API_KEY') {
			console.log('Set your API_KEY in app/FirebaseConstants.js')
			return null;
		}
        
        let url = FirebaseAPI_URL.MANAGING_SEND_MESSAGE
        // let url = 'https://android.googleapis.com/gcm/notification?notification_key_name=PISUs_Group'
		CORS.POSTCORSRequest(url, body,
			(data) => {
				console.log('send remote success:', data)
				// console.log('Send Notification thành công')
			},
			(error) => {
				console.log('Có lỗi trong quá trình send Notification')
				// console.log('Có lỗi trong quá trình send Notification')
			}, null, custom_headers)
	}
module.exports.create_devices_group = function(notification_key_name, arr_registration_ids){
		if (FirebaseConstants.KEY === 'YOUR_API_KEY') {
			console.log('Set your API_KEY in app/FirebaseConstants.js')
			return null;
		}
	
		let url = `${FirebaseAPI_URL.MANAGING_DEVICE_GROUPS}`
		let f_data = {
			"operation": "create",
			"notification_key_name": notification_key_name,
			"registration_ids": arr_registration_ids
		}
		// let result = new Promise()
		return new Promise((resolve, reject)=>{
			CORS.POSTCORSRequest(url, JSON.stringify(f_data), 
			(data)=>{
				resolve(data)
			},
			(error)=>{
				reject(error)
			},
			null,
			custom_headers)
		}) 
	}

module.exports.retrieve_token_devices_group = function(notification_key_name){
		if (FirebaseConstants.KEY === 'YOUR_API_KEY') {
			console.log('Set your API_KEY in app/FirebaseConstants.js')
			return null;
		}
		
		let url = `${FirebaseAPI_URL.MANAGING_DEVICE_GROUPS}?notification_key_name=${notification_key_name}`
		return new Promise((resolve, reject)=>{
			CORS.GETCORSRequest(url, null, 
				(data)=>{
					resolve(data)
				},
				(error)=>{
					reject(error)
				},
				null,
				custom_headers)
		})
		
	}
	//notification_key_name là Tên Group (unique)
module.exports.send_to_devices_group = function(notification_key_name, titleText, bodyText){
		if (FirebaseConstants.KEY === 'YOUR_API_KEY') {
			console.log('Set your API_KEY in app/FirebaseConstants.js')
			return;
		}
		
		this.retrieve_token_devices_group(notification_key_name)
		.then((token)=>{
			console.log('token group:', token.notification_key)
			let body = this.create_body(token.notification_key, titleText, bodyText)
			this.send(JSON.stringify(body), "send-to-group")
		})
		.catch((error)=>{
			console.log(error)
		})
	}

module.exports.create_body = function(to, titleText, bodyText){
		let body = {
			"to": to,
			"notification": {
			  "title": titleText,
			  "body": bodyText,
			  "sound": "default"
			},
			"data": {
			  "custom_notification": {
				"title": titleText,
				"body": bodyText,
				"sound": "default",
				"priority": "high",
				"show_in_foreground": true
			  },
			  "property1": "value1",
			  "property2": "value2",
			  "property3": "value3"
			},
			"priority": "high"
		  }
		  return body
	}
