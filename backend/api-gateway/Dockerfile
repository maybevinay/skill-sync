FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /src
COPY backend/api-gateway/pom.xml .
COPY backend/api-gateway/src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /src/target/*.jar app.jar
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0 -XX:+UseSerialGC"
EXPOSE 10000
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
