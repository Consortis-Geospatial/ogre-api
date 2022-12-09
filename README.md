An api for gdal operations. Converts shapefile(zip), kml, kmz, dxf to geojson and geojson to shapefile(zip)

Tested in nove version 12.22.6

In order to run you must have gdal installed and set your environmental variables

For a 64bit OSGeo4W install:

setx PATH "%PATH%;C:\OSGeo4W64\bin"
setx GDAL_DATA "C:\OSGeo4W64\share\gdal"
setx PROJ_LIB "C:\OSGeo4W64\share\proj"

For a 32bit OSGeo4W install:

setx PATH "%PATH%;C:\OSGeo4W\bin"
setx GDAL_DATA "C:\OSGeo4W\share\gdal"
setx PROJ_LIB "C:\OSGeo4W\share\proj"

## ENDPOINTS

**convertJson**
convertJson : POST - e.g. localhost:3100/api/v1/convertJson

Converts geojson to shapefile(zip), csv or dxf

PARAMETERS
json - text of the GeoJSON file forceUTF8 (optional)
forceUTF8(optional) - boolean true/false
format (optional) - File format supported, CSV or DXF, leave blank for shapefile

**convert**
convert : POST - e.g. localhost:3100/api/v1/convert

Converts shapefile(zip), kml, kmz, dxf to geojson

PARAMETERS
upload - the file being uploaded
sourceSrs (optional) - the original projection

# Configuration

Basic configuration **production and development**

NODE_PORT: port that the api runs
API_VERSION: 1 . Goes at the end of the host and port of the api e.g. localhost:3100/api/v1
