echo off

echo formatting site
echo.
call npx prettier --write site

echo.
echo formatting functions
echo.
call npx prettier --write rawfunctions
