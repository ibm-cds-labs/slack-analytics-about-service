# slack-analytics-integration-service

The Slack analytics integration service provides users access to curated information from your Slack team's social graph.

1. [Set up IBM Graph and generate the social graph for your Slack team](https://github.ibm.com/analytics-advocacy/slack-analytics-sandbox).
2. Clone this repository and deploy the service in Bluemix. Note that the service is automatically bound to the IBM Graph service instance `slack-graph-database` you've created in step 1.

	```
	$ git clone https://github.ibm.com/analytics-advocacy/slack-analytics-about-service.git
	$ cd slack-analytics-about-service
	$ cf push --no-start
	```
 > Do not start the service. It still needs to be configured.

3. Configure a new Slack integration

	* [Log in to your Slack team](https://www.slack.com) as an admin.
	* Open [https://slack.com/services/new/slash-commands](https://slack.com/services/new/slash-commands) in your browser.
	* Enter `/about` as a new command and press button for "Add a new slash command integration."
	* As _URL_, enter the service URL, e.g.  `https://about-slack.mybluemix.net/ask`.
	* Choose `POST` as _method_. 
	* Take note of the token. You need this value in the next step when you configure the service.
	* Optionally, enable autocomplete and provide a description `Learn more about your Slack team` and usage hint `@user #channel`
	* Save the slash command integration.

4. Define user-defined variable `SLACK_TOKEN` and assign the token value from the Slack integration settings screen.

	```
	$ cf set-env about-slack SLACK_TOKEN <SLACK_TOKEN_VALUE>
	```

	> Set user-defined variable `DEBUG` to `*` or `slack-about-service` to enable debug output in the Cloud Foundry console log.
	> ```
	> $ cf set-env about-slack DEBUG slack-about-service
	> ```

5. Start the service.

	```
	$ cf start about-slack
	```

	> The service does not provide a web interface. Check the Cloud Foundry console log to make sure the service started successfully.

	```
	$ cf logs about-slack --recent
	```

	> The service won't start if no IBM Graph service instance named `slack-graph-database` is bound to the application or if environment variable `SLACK_TOKEN` is not defined.

6. In Slack, enter one of the following commands: 

	* `/about` to display help information.
	* `/about @userName` to display statistics for `userName`.
	* `/about #channelName` to display statistics for `channelName`.
 
![](https://raw.github.ibm.com/analytics-advocacy/slack-analytics-about-service/master/about_demo.gif?token=AAAf8EWprDY3XqaMTzqEJbjld_SMxZGqks5XPlwYwA%3D%3D)	
	
