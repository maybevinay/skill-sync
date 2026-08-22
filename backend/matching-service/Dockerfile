FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /src
COPY backend/matching-service/pom.xml .
COPY backend/matching-service/src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends postgresql-client \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /src/target/*.jar app.jar
COPY scripts/render-create-databases.sh /app/render-create-databases.sh
RUN chmod +x /app/render-create-databases.sh
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0 -XX:+UseSerialGC"
EXPOSE 10000
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
