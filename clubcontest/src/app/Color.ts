export class Color{
    
public static Start = "#FF0000";
public static Finish = "#0000FF";

public static get(index:number){
    return Color.colors[index];
}

  private static colors = [
    /*  Blue:*/ "#0082c8",
    /*  Green:*/"#3cb44b",        
    /*  Orange:-*/ "#f58231",
    /*  Purple:*/ "#911eb4",
    /*  Cyan:*/ "#46f0f0",
    /*  Magenta:*/ "#f032e6",
    /*  Lime:*/ "#d2f53c",
    /*  Yellow:*/ "#ffe119",
    /*  Pink:*/ "#fabebe",
    /*  Teal:*/ "#008080",
    /*  Lavender:*/ "#e6beff",
    /*  Brown:*/ "#aa6e28",
    /*  Beige:*/ "#fffac8",
    /*  Maroon:*/ "#800000",
    /*  Mint:*/ "#aaffc3",
    /*  Olive:*/ "#808000",
    /*  Coral:*/ "#ffd8b1",
    /*  Navy:*/ "#000080",
    /*  Grey:*/ "#808080",
    /*  White:*/ "#FFFFFF",
    /*  Black:*/ "#000000",
    /*  Red: */"#e6194b",
  ]
}