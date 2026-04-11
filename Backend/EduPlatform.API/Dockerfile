# ── Frontend (Vite + React) ─────────────────────────────────────────
FROM node:22-alpine AS frontend
WORKDIR /frontend

COPY Frontend/package.json Frontend/package-lock.json ./
RUN npm ci

COPY Frontend/ ./
# نفس المنشأ: الواجهة تستدعي /api على نفس الدومين
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ── .NET API ───────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY Backend/EduPlatform.API/EduPlatform.API.csproj Backend/EduPlatform.API/
RUN dotnet restore Backend/EduPlatform.API/EduPlatform.API.csproj

COPY Backend/EduPlatform.API/ Backend/EduPlatform.API/

RUN mkdir -p Backend/EduPlatform.API/wwwroot
COPY --from=frontend /frontend/dist Backend/EduPlatform.API/wwwroot/

RUN dotnet publish Backend/EduPlatform.API/EduPlatform.API.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish ./

ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "EduPlatform.API.dll"]
