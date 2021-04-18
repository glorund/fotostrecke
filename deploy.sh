 #!/usr/bin/env bash
 ng build --prod --base-href "https://www.agnesadventure.de/"
 #npx angular-cli-ghpages --dir=dist/fotostrecke
 ng deploy --cname=www.agnesadventure.de
 