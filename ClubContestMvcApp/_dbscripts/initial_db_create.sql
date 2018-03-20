CREATE TABLE [dbo].[CC_User] (
    [Id]      INT            IDENTITY (1, 1) NOT NULL,
    [Auth0Id] NVARCHAR (400) NOT NULL,
    [Name]    NVARCHAR (MAX) NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE UNIQUE NONCLUSTERED INDEX [IX_User_Column]
    ON [dbo].[CC_User]([Auth0Id] ASC);


		
CREATE TABLE [dbo].[CC_Competition] (
    [Id]         INT            IDENTITY (1, 1) NOT NULL,
    [Name]       NVARCHAR (MAX) NOT NULL,
    [CreatorId]  INT            NOT NULL,
    [AdminUsers] NVARCHAR (MAX) NULL,
    [Waypoints] NVARCHAR(MAX) NULL, 
    PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Competition_ToTable] FOREIGN KEY ([CreatorId]) REFERENCES [dbo].[CC_User] ([Id])
);

CREATE TABLE [dbo].[CC_Day] (
    [Id]             INT            IDENTITY (1, 1) NOT NULL,
    [Date]           DATE           NOT NULL,
    [CompetitionId]  INT            NOT NULL,
    [Task]           NVARCHAR (MAX) NULL,
    [TaskFileFormat] NVARCHAR (MAX) NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Day_Competition] FOREIGN KEY ([CompetitionId]) REFERENCES [dbo].[CC_Competition] ([Id]) ON DELETE CASCADE
);


CREATE TABLE [dbo].[CC_Flight] (
    [Id]         INT            IDENTITY (1, 1) NOT NULL,
    [DayId]      INT            NOT NULL,
    [IgcFile]    NVARCHAR (MAX) NOT NULL,
    [UserId]     INT            NOT NULL,
    [Speed]      FLOAT (53)     NULL,
    [Distance]   FLOAT (53)     NULL,
    [Duration]   FLOAT (53)     NULL,
    [TurnPoints] NVARCHAR (MAX) NULL,
    [Finished]   BIT            NULL,
    [GliderType] NVARCHAR (MAX) NULL,
    [Handicap]   FLOAT (53)     DEFAULT ((1)) NOT NULL,
    [PilotName] NVARCHAR (MAX) NULL,
	PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Flight_Day] FOREIGN KEY ([DayId]) REFERENCES [dbo].[CC_Day] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Flight_User] FOREIGN KEY ([UserId]) REFERENCES [dbo].[CC_User] ([Id])
);









