FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY backend/pom.xml .
COPY backend/src ./src
RUN apk add --no-cache maven && mvn -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
