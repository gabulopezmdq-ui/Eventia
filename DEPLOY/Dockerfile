FROM mcr.microsoft.com/dotnet/core/sdk:3.1 as build

WORKDIR /

# Copy the contents of certs directory from the local machine to
# a new directory certs inside the container
COPY ./certs/ ./certs/
WORKDIR ./certs/
run apt-get install -y ca-certificates
RUN cp fortigate.crt /usr/local/share/ca-certificates
run update-ca-certificates

#De ahi corres este comando que actualiza los repositorios del contenedor,
#installa nginx y hace un clean de aptitude
RUN apt update && \
    apt-get install -y nginx && \
    apt-get clean

#Copio la configuracion con el proxy pass, el re-write y la carpeta raiz
#del nginx. Te dejo la configuracion que uso tambien en el mail
COPY ["nginx/nginx.conf", "/etc/nginx/nginx.conf"]

#Ahora los archivos estaticos que genere con 'npm run build' a
#las carpetas que declare adentro de la configuracion de nginx
COPY ["build", "/usr/share/nginx/html"]
#COPY ["BACKOFFICE", "/usr/share/nginx/html/backoffice"]


FROM mcr.microsoft.com/dotnet/core/aspnet:3.1 AS runtime

WORKDIR /app

RUN apt update && \
    apt-get install -y nginx && \
    apt-get clean

RUN apt update && apt install -y curl libgdiplus gnupg && \
    curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list >> /etc/apt/sources.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y mssql-tools && \
    apt-get clean && \
    curl -s https://deb.nodesource.com/setup_18.x | bash - && \
    apt update


COPY /publish/ ./

ENV TZ=America/Argentina/Buenos_Aires
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone 

RUN rm -f /app/startup.sh
COPY startup.sh /app
RUN chmod 755 /app/startup.sh

RUN rm -f /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx

COPY ./build /usr/share/nginx/html

ENV ASPNETCORE_URLS http://+:5000
#EXPOSE 5000 80

#ENTRYPOINT ["dotnet", "rsCPO.dll"]
#CMD ["nginx", "-g", "daemon off;"]
CMD ["sh", "/app/startup.sh"]
