VER=$(git tag | tail -1)
./tests.js 1 10000 false $VER 1>>out.dat
./tests.js 2 10000 false $VER 1>>out.dat
./tests.js 256 50000 false $VER 1>>out.dat
./tests.js 1024 50000 false $VER 1>>out.dat
./tests.js 4096 50000 false $VER 1>>out.dat
./tests.js 16384 50000 false $VER 1>>out.dat