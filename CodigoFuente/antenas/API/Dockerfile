# Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app
COPY . .
RUN dotnet restore API.csproj
RUN dotnet publish API.csproj -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080URLS=http://0.0.0.0:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "API.dll"]


# FROM mcr.microsoft.com/dotnet/sdk:7.0 as buildAPI
# COPY ./DEPLOY/certs/ ./certs/
# WORKDIR ./certs/
# RUN apt-get install -y ca-certificates
# RUN cp fortigate.crt /usr/local/share/ca-certificates
# RUN update-ca-certificates
# RUN rm -f /etc/ssl/openssl.cnf
# RUN chmod 777 /etc/ssl
# COPY ./DEPLOY/openssl.cnf /etc/ssl/
# #RUN npm config set strict-ssl false
# WORKDIR /API
# COPY ./CodigoFuente/antenas/API/*.csproj /API/
# RUN dotnet restore
# COPY ./CodigoFuente/antenas/API /API
# RUN dotnet publish -c Release -o /API/out

# FROM node:16.18 as buildFront
# COPY ./DEPLOY/certs/ ./certs/
# WORKDIR ./certs/
# RUN apt-get install -y ca-certificates
# RUN cp fortigate.crt /usr/local/share/ca-certificates
# RUN update-ca-certificates
# RUN rm -f /etc/ssl/openssl.cnf
# RUN chmod 777 /etc/ssl
# COPY ./DEPLOY/openssl.cnf /etc/ssl/
# RUN npm config set strict-ssl false

# WORKDIR /App
# COPY ./CodigoFuente/antenas/React/package*.json ./
# COPY ./CodigoFuente/antenas/React/.npmrc ./
# RUN npm install
# COPY ./CodigoFuente/antenas/React ./
# COPY ./DEPLOY/.env ./
# RUN npm run build

# FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS runtime
# WORKDIR /
# RUN rm -f /etc/ssl/openssl.cnf
# RUN chmod 777 /etc/ssl
# COPY ./DEPLOY/openssl.cnf /etc/ssl/
# WORKDIR /app
# RUN apt update && \
#     apt-get install -y nginx && \
#     apt-get clean

# RUN apt update && apt install --no-install-recommends -y curl gnupg && \
#     curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
#     curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
#     apt-get update && \
#     ACCEPT_EULA=Y apt-get install -y msodbcsql17 && \
#     apt-get clean

# ENV TZ=America/Argentina/Buenos_Aires
# RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone 
# RUN rm -f /app/startup.sh
# COPY ./DEPLOY/startup.sh /app
# RUN chmod 755 /app/startup.sh
# RUN rm -f /etc/nginx/nginx.conf
# # COPY ./API/out .dicj
# COPY --from=buildAPI /API/out .
# # COPY ./Front_React/build /usr/share/nginx/html
# COPY --from=buildFront /App/build /usr/share/nginx/html
# COPY ./DEPLOY/nginx.conf /etc/nginx
# ENV ASPNETCORE_URLS http://+:5000
# EXPOSE 3000
# EXPOSE 3005
# EXPOSE 5000
# CMD ["sh", "/app/startup.sh"]