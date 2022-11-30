#!/bin/bash -x
# ISSUE_TITLE="$1"
# ISSUE_BODY="$2"
# ISSUE_URL="$3"
RUN_ID="$1"
SLACK_WEBHOOK_URL="$2"
API_TOKEN_TO_GITHUB="$3"
ISSUE_TITLE = "THIS IS A TEST ISSUE"
TIME_STAMP="`date +%s`"
cat <<EOT > /tmp/slack_message.json
{
    "type": "mrkdwn",
    "text": "New Test Issue Opened on Node Ottoman ",
    "attachments": [
        {
            "fallback": "Test Ottoman Issue",
            "color": "#36a64f",
            "pretext": "Newly Opened Issue : ${ISSUE_TITLE} \n \n \n \n For more details about issue: ",
            "footer_icon": "https://www.couchbase.com/webfiles/1629373386042/images/favicon.ico",
            "ts": ${TIME_STAMP}
        }
    ]
}
EOT

cat /tmp/slack_message.json

curl -X POST -H 'Content-type: application/json' --data @/tmp/slack_message.json ${SLACK_WEBHOOK_URL}