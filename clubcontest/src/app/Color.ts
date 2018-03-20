export class Color{
    
public static Start = "#F00";
public static Finish = "#00F";

public static get(index:number){
    return Color.colors[index];
}

  private static colors = [
    /* 0 Red: */"#e6194b",
    /* 1 Green:*/"#3cb44b",    
    /* 2 Blue:*/ "#0082c8",
    /* 3 Orange:-*/ "#f58231",
    /* 4 Purple:*/ "#911eb4",
    /* 5 Cyan:*/ "#46f0f0",
    /* 6 Magenta:*/ "#f032e6",
    /* 7 Lime:*/ "#d2f53c",
    /* 8 Yellow:*/ "#ffe119",
    /* 9 Pink:*/ "#fabebe",
    /* 10 Teal:*/ "#008080",
    /* 11 Lavender:*/ "#e6beff",
    /* 12 Brown:*/ "#aa6e28",
    /* 13 Beige:*/ "#fffac8",
    /* 14 Maroon:*/ "#800000",
    /* 15 Mint:*/ "#aaffc3",
    /* 16 Olive:*/ "#808000",
    /* 17 Coral:*/ "#ffd8b1",
    /* 18 Navy:*/ "#000080",
    /* 19 Grey:*/ "#808080",
    /* 20 White:*/ "#FFFFFF",
    /* 21 Black:*/ "#000000"
  ]
}