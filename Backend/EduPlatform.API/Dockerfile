FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

COPY Backend/EduPlatform.API/EduPlatform.API.csproj Backend/EduPlatform.API/
RUN dotnet restore Backend/EduPlatform.API/EduPlatform.API.csproj

COPY Backend/EduPlatform.API/ Backend/EduPlatform.API/
RUN dotnet publish Backend/EduPlatform.API/EduPlatform.API.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app

COPY --from=build /app/publish ./

ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "EduPlatform.API.dll"]
