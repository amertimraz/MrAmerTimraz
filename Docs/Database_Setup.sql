-- ============================================================
-- EduPlatform Database Setup Script
-- SQL Server / SQL Server Express
-- ============================================================

CREATE DATABASE EduPlatformDB;
GO
USE EduPlatformDB;
GO

-- Users Table
CREATE TABLE Users (
    Id            INT           PRIMARY KEY IDENTITY(1,1),
    Name          NVARCHAR(100) NOT NULL,
    Email         NVARCHAR(200) NOT NULL UNIQUE,
    PasswordHash  NVARCHAR(500) NOT NULL,
    Role          NVARCHAR(20)  NOT NULL DEFAULT 'Student'
                    CHECK (Role IN ('Student','Teacher','Admin')),
    IsActive      BIT           NOT NULL DEFAULT 1,
    ProfileImage  NVARCHAR(500) NULL,
    CreatedAt     DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);

-- Courses Table
CREATE TABLE Courses (
    Id           INT            PRIMARY KEY IDENTITY(1,1),
    Title        NVARCHAR(200)  NOT NULL,
    Description  NVARCHAR(MAX)  NULL,
    ThumbnailUrl NVARCHAR(500)  NULL,
    Category     NVARCHAR(100)  NULL,
    IsPublished  BIT            NOT NULL DEFAULT 0,
    CreatedBy    INT            NOT NULL REFERENCES Users(Id),
    CreatedAt    DATETIME2      NOT NULL DEFAULT GETUTCDATE()
);

-- Videos Table
CREATE TABLE Videos (
    Id              INT           PRIMARY KEY IDENTITY(1,1),
    CourseId        INT           NOT NULL REFERENCES Courses(Id) ON DELETE CASCADE,
    Title           NVARCHAR(200) NOT NULL,
    Description     NVARCHAR(MAX) NULL,
    Url             NVARCHAR(500) NOT NULL,
    Source          NVARCHAR(20)  NOT NULL DEFAULT 'YouTube'
                      CHECK (Source IN ('YouTube','Vimeo','Upload')),
    DurationSeconds INT           NOT NULL DEFAULT 0,
    OrderIndex      INT           NOT NULL DEFAULT 0,
    CreatedAt       DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);

-- Tests Table
CREATE TABLE Tests (
    Id              INT           PRIMARY KEY IDENTITY(1,1),
    CourseId        INT           NOT NULL REFERENCES Courses(Id) ON DELETE CASCADE,
    Title           NVARCHAR(200) NOT NULL,
    Description     NVARCHAR(MAX) NULL,
    DurationMinutes INT           NOT NULL DEFAULT 30,
    PassingScore    INT           NOT NULL DEFAULT 60,
    IsPublished     BIT           NOT NULL DEFAULT 0,
    CreatedAt       DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);

-- Questions Table
CREATE TABLE Questions (
    Id           INT           PRIMARY KEY IDENTITY(1,1),
    TestId       INT           NOT NULL REFERENCES Tests(Id) ON DELETE CASCADE,
    QuestionText NVARCHAR(MAX) NOT NULL,
    QuestionType NVARCHAR(30)  NOT NULL DEFAULT 'MultipleChoice'
                   CHECK (QuestionType IN ('TrueFalse','MultipleChoice','FillBlank','Ordering')),
    Options       NVARCHAR(MAX) NULL,
    CorrectAnswer NVARCHAR(MAX) NULL,
    Points        INT           NOT NULL DEFAULT 1,
    OrderIndex    INT           NOT NULL DEFAULT 0,
    ImageUrl      NVARCHAR(500) NULL
);

-- Results Table
CREATE TABLE Results (
    Id          INT       PRIMARY KEY IDENTITY(1,1),
    StudentId   INT       NOT NULL REFERENCES Users(Id),
    TestId      INT       NOT NULL REFERENCES Tests(Id) ON DELETE CASCADE,
    Score       FLOAT     NOT NULL DEFAULT 0,
    MaxScore    FLOAT     NOT NULL DEFAULT 0,
    Passed      BIT       NOT NULL DEFAULT 0,
    Answers     NVARCHAR(MAX) NULL,
    CompletedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Enrollments Table
CREATE TABLE Enrollments (
    Id         INT       PRIMARY KEY IDENTITY(1,1),
    StudentId  INT       NOT NULL REFERENCES Users(Id),
    CourseId   INT       NOT NULL REFERENCES Courses(Id) ON DELETE CASCADE,
    EnrolledAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    Progress   FLOAT     NOT NULL DEFAULT 0,
    UNIQUE (StudentId, CourseId)
);

-- Notifications Table
CREATE TABLE Notifications (
    Id        INT            PRIMARY KEY IDENTITY(1,1),
    UserId    INT            NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    Title     NVARCHAR(200)  NOT NULL,
    Message   NVARCHAR(MAX)  NOT NULL,
    IsRead    BIT            NOT NULL DEFAULT 0,
    Link      NVARCHAR(500)  NULL,
    CreatedAt DATETIME2      NOT NULL DEFAULT GETUTCDATE()
);

GO

-- ============================================================
-- Seed default users (passwords hashed with BCrypt)
-- Admin@123  | Teacher@123  | Student@123
-- ============================================================
INSERT INTO Users (Name, Email, PasswordHash, Role) VALUES
(N'Admin',       'admin@eduplatform.com',   '$2a$11$KkVHEVdTJp5VPekWpVRjBuWn7.4TSG1RBk6B/UJbNkWB04gE8Swgq', 'Admin'),
(N'Mr. Ahmed',   'teacher@eduplatform.com', '$2a$11$sXb3aXe3VGeTFJGkUW5s0e4BkKBOVxz7kHiXl5CWoKfqN3QjQBF5S', 'Teacher'),
(N'Ali Student', 'student@eduplatform.com', '$2a$11$AuJk3m6CxSQJ8PBQU3Q6Bu7VGj3ORsVZjdLVXqzFiJmJhsqv2T1Oi', 'Student');
GO

PRINT 'EduPlatformDB created and seeded successfully!';
GO
