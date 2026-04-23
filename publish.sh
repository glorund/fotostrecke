ng build --configuration production
rsync -avz --delete dist/fotostrecke/  glorund@gotmog.agnesadventure.de:/var/www/fotostrecke/
