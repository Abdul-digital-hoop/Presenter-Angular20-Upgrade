import { Injectable } from '@angular/core';
import { PresentationService } from './presentation.service';
import { WorkspaceService } from 'src/app/core/Sevices/WorkSpace/workspace.service';
export class ImageTypeClass {
  Type:string;
}
@Injectable({
  providedIn: 'root'
})
export class PresentationThemeService {
  // Array to hold default themes
  public defaultThemes: any[] = [];
  // Array to hold customer themes
  public customerThemes: any[] = [];
  // Variable to keep track of the current data count section
  public currentDataCountSection: number = 1;
  // Variable to set the number of theme records to fetch
  public numberofThemeRecord: number = 10;
  public customeThemeId:string;
  public customerThemeBackgroundImage:string ="";
  public customerThemeLogoImage:string ="";
  public customerThemeLogoCropPosition:{ x1: number; y1: number; x2: number; y2: number };
  public logoPositionType:string='';

  public objForPassingImageTypeToChildComponent:ImageTypeClass= new ImageTypeClass();

  constructor(public presentationService: PresentationService ,public workspaceService:WorkspaceService,) { }

  // Method to fetch customer and default themes
  getCustomerThemesAndDefaultThemes(): Promise<void> {
    return new Promise((resolve, reject) => {
      const getCustomerThemesParams = {
        pageNumber: this.currentDataCountSection,
        numberofRecords: this.numberofThemeRecord
      };

      this.presentationService.getUserThemesAndDefaultThemes(getCustomerThemesParams).subscribe(
        (response: any) => {
          if (response) {
            this.defaultThemes = response.defaultThemes;
            this.customerThemes = response.customerThemes;
            resolve();
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
  // Method to create a new theme
  createTheme(themeName:string): Promise<any> {
    const createThemeDTO = {
      PresentationId: this.workspaceService.presentationId,
      ThemeName:themeName,
      isTemplate: this.workspaceService.isTemplate
    };
    return new Promise((resolve, reject) => {
      this.presentationService.createTheme(createThemeDTO).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
  // Method to get a theme by its ID
  getThemeById(themeId: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.presentationService.getThemeById(themeId).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
  // Method to apply a theme
  applyTheme(themeId: string): Promise<any> {
    const applyThemeDTO = {
      PresentationId: this.workspaceService.presentationId,
      ThemeId: themeId
    };
    return new Promise((resolve, reject) => {
      this.presentationService.applyTheme(applyThemeDTO).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
  // Method to update theme name
  updateThemeName(themeId: string, themeName: string): Promise<any> {
    const updateThemeNameDTO = {
      PresentationId: this.workspaceService.presentationId,
      ThemeId: themeId,
      ThemeName: themeName,
      isTemplate: this.workspaceService.isTemplate
    };
    return new Promise((resolve, reject) => {
      this.presentationService.editTheme(updateThemeNameDTO).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
  // Method to update theme logo
  updateThemeLogo(themeLogoOriginalUrl: string, themeLogoImageCroppedUrl: string, croppedPosition: any): Promise<any> {
    const updateThemeLogoDTO = {
      PresentationId: this.workspaceService.presentationId,
      ThemeId: this.customeThemeId,
      ThemeLogo: {
        LogoOriginalUrl: themeLogoOriginalUrl,
        LogoCroppedUrl: themeLogoImageCroppedUrl,
        Croppedposition: croppedPosition
      },
      isTemplate: this.workspaceService.isTemplate
    };
    return new Promise((resolve, reject) => {
      this.presentationService.updateThemeLogo(updateThemeLogoDTO).subscribe(
        (response: any) => {
          if (response) {
            this.checkOrientation(this.customerThemeLogoCropPosition);
            resolve(response);
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
  // Method to update theme background color
  updateThemeBackgroundColor(themeId: string, themeBackgroundColor: string): Promise<any> {
    const updateThemeBackgroundColorDTO = {
      PresentationId: this.workspaceService.presentationId,
      ThemeId: themeId,
      ThemeBackgroundColor: themeBackgroundColor,
      isTemplate: this.workspaceService.isTemplate
    };
    return new Promise((resolve, reject) => {
      this.presentationService.updateThemeBackgroundColor(updateThemeBackgroundColorDTO).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
  // Method to update theme background image
  updateThemeBackgroundImage(themeBackgroundImageOriginalUrl: string, themeBackgroundImageCroppedUrl: string, croppedPosition: any,isTemplate: boolean): Promise<any> {
    const updateThemeBackgroundImageDTO = {
      PresentationId: this.workspaceService.presentationId,
      ThemeId: this.customeThemeId,
      ThemeBackgroundImage: {
        ThemeBackgroundImageOriginalUrl: themeBackgroundImageOriginalUrl,
        ThemeBackgroundImageCroppedUrl: themeBackgroundImageCroppedUrl,
        Croppedposition: croppedPosition
      },
      isTemplate: this.workspaceService.isTemplate
    };
    return new Promise((resolve, reject) => {
      this.presentationService.updateThemeBackgroundImage(updateThemeBackgroundImageDTO).subscribe(
        (response: any) => {
          if (response) {

            resolve(response);
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
  // Method to update theme line color
  updateThemeLineColor(themeId: string, themeLineColor: string): Promise<any> {
    const updateThemeLineColorDTO = {
      PresentationId: this.workspaceService.presentationId,
      ThemeId: themeId,
      ThemeLineColor: themeLineColor,
      isTemplate: this.workspaceService.isTemplate
    };
    return new Promise((resolve, reject) => {
      this.presentationService.updateThemeLineColor(updateThemeLineColorDTO).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
  // Method to update theme text color
  updateThemeTextColor(themeId: string, themeTextColor: string): Promise<any> {
    const updateThemeTextColorDTO = {
      PresentationId: this.workspaceService.presentationId,
      ThemeId: themeId,
      ThemeTextColor: themeTextColor,
      isTemplate: this.workspaceService.isTemplate
    };
    return new Promise((resolve, reject) => {
      this.presentationService.updateThemeTextColor(updateThemeTextColorDTO).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }

  // Method to update theme font
  updateThemeFont(themeId: string, themeFont: string): Promise<any> {
    const updateThemeFontDTO = {
      PresentationId: this.workspaceService.presentationId,
      ThemeId: themeId,
      ThemeFont: themeFont,
      isTemplate: this.workspaceService.isTemplate
    };
    return new Promise((resolve, reject) => {
      this.presentationService.updateThemeFont(updateThemeFontDTO).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }

  // Method to update theme visualization colors
  updateThemeVisualizationColors(themeId: string, themeVisualizationColors: any[]): Promise<any> {
    const updateChartColorDTO = {
      PresentationId: this.workspaceService.presentationId,
      ThemeId: themeId,
      ThemesChartColor: themeVisualizationColors.map(item => ({
        height: item.height, // Assuming height is not relevant for this operation
        Color: item.color
      })),
      isTemplate: this.workspaceService.isTemplate
    };
    return new Promise((resolve, reject) => {
      this.presentationService.updateThemeVisualizationColors(updateChartColorDTO).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }

  // Method to update theme background color opacity
  updateThemeBackgroundColorOpacity(themeId: string, themeBackgroundColorOpacity: number): Promise<any> {
    const updateBackgroundColorOpacityDTO = {
      PresentationId: this.workspaceService.presentationId,
      ThemeId: themeId,
      ThemesBackgroundColorOpacity: themeBackgroundColorOpacity,
      isTemplate: this.workspaceService.isTemplate
    };
    return new Promise((resolve, reject) => {
      this.presentationService.updateThemeBackgroundColorOpacity(updateBackgroundColorOpacityDTO).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
  // Method to update theme text bold
  updateThemeTextBold(themeId: string, isBold: boolean): Promise<any> {
    const updateTextBoldDTO = {
      PresentationId: this.workspaceService.presentationId,
      ThemeId: themeId,
      Fontbold: isBold,
      isTemplate: this.workspaceService.isTemplate
    };
    return new Promise((resolve, reject) => {
      this.presentationService.updateThemeTextBold(updateTextBoldDTO).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
  // Method to update theme text italic
  updateThemeTextItalic(themeId: string, isItalic: boolean): Promise<any> {
    const updateTextItalicDTO = {
      PresentationId: this.workspaceService.presentationId,
      ThemeId: themeId,
      FontItalic: isItalic,
      isTemplate: this.workspaceService.isTemplate
    };
    return new Promise((resolve, reject) => {
      this.presentationService.updateThemeTextItalic(updateTextItalicDTO).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
  // Method to update theme text strike-through
  updateThemeTextStrick(themeId: string, isStrick: boolean): Promise<any> {
    const updateTextStrickDTO = {
      PresentationId: this.workspaceService.presentationId,
      ThemeId: themeId,
      FontStrickout: isStrick,
      isTemplate: this.workspaceService.isTemplate
    };
    return new Promise((resolve, reject) => {
      this.presentationService.updateThemeTextStrikethrough(updateTextStrickDTO).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
  // Method to update theme text underline
  updateThemeTextUnderlined(themeId: string, isUnderlined: boolean): Promise<any> {
    const updateTextUnderlinedDTO = {
      PresentationId: this.workspaceService.presentationId,
      ThemeId: themeId,
      FontUnderLine: isUnderlined,
      isTemplate: this.workspaceService.isTemplate
    };
    return new Promise((resolve, reject) => {
      this.presentationService.updateThemeTextUnderline(updateTextUnderlinedDTO).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
  // Method to increase font size
  increaseFontSize(themeId: string,fontSize:number): Promise<any> {
    const increaseFontSizeDTO = {
      PresentationId: this.workspaceService.presentationId,
      ThemeId: themeId,
      FontSize: fontSize,
      isTemplate: this.workspaceService.isTemplate
    };
    return new Promise((resolve, reject) => {
      this.presentationService.updateFontSize(increaseFontSizeDTO).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
  // Method to remove theme logo
  removeThemeLogo(): Promise<any> {
    const removeThemeLogoDTO = {
      PresentationId: this.workspaceService.presentationId,
      ThemeId: this.customeThemeId,
      isTemplate: this.workspaceService.isTemplate
    };
    return new Promise((resolve, reject) => {
      this.presentationService.removeThemeLogo(removeThemeLogoDTO).subscribe(
        (response: any) => {
          if (response) {
            this.customerThemeLogoImage = "";
            resolve(response);
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
  // Method to remove theme background image
  removeThemeBackgroundImage(): Promise<any> {
    const removeThemeBackgroundImageDTO = {
      PresentationId: this.workspaceService.presentationId,
      ThemeId: this.customeThemeId,
      isTemplate: this.workspaceService.isTemplate
    };
    return new Promise((resolve, reject) => {
      this.presentationService.removeThemeBackgroundImage(removeThemeBackgroundImageDTO).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
            this.customerThemeBackgroundImage = "";
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
  // Method to delete theme
  deleteTheme(themeId: string): Promise<any> {
    var deleteThemeDTO={
      themeId : themeId
    }
    return new Promise((resolve, reject) => {
      this.presentationService.deleteTheme(deleteThemeDTO).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
  resetThemeToDefault(themeId: string): Promise<any> {
    const resetThemeToDefaultDTO = {
      PresentationId: this.workspaceService.presentationId,
      ThemeId: themeId,
      isTemplate: this.workspaceService.isTemplate
    };
    return new Promise((resolve, reject) => {
      this.presentationService.resetThemeToDefault(resetThemeToDefaultDTO).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
          } else {
            console.error('No response received');
            reject('No response received');
          }
        },
        (error: any) => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
  // Method to update customer theme
  updateCustomerTheme(theme:any){
    const index = this.customerThemes.findIndex(t => t.id === theme.id);
    if (index !== -1) {
      this.customerThemes[index] = theme;
    }
  }
  setImageType(type:string){
    this.objForPassingImageTypeToChildComponent.Type = type;
  }
  checkOrientation(croppedPosition: { x1: number; y1: number; x2: number; y2: number }): string {
    if (croppedPosition != null) {
      const width = croppedPosition.x2 - croppedPosition.x1;
      const height = croppedPosition.y2 - croppedPosition.y1;

      const aspectRatio = (width == 0 && height == 0) ? 0:width / height;

      if (aspectRatio > 2) {
        this.logoPositionType = 'Landscape';
        return 'Landscape';
      } else {
        this.logoPositionType = 'Portrait';
        return 'Portrait';
      }
    }

  }
}
