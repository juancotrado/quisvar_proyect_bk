export const recoveryPasswordHtml = (name: string, linkReset: string) => {
  return `
  <div  
  style="
    display: flex;
    width: 100%;
    "   >
    <span
        class="m_-5492978235239917155mb_text"
        style="
          font-family: Helvetica Neue, Helvetica, Lucida Grande, tahoma, verdana,
            arial, sans-serif;
          font-size: 16px;
          line-height: 21px;
          color: #141823;
          margin: auto;
          width: 560px;

        "
        ><span style="font-size: 15px"
          ><p></p>
          <div style="margin-top: 16px; margin-bottom: 20px">
            Hola, ${name}:
          </div>
          <div>
            Recibimos una solicitud para restablecer tu contraseña de DHYRIUM.
          </div>
          Ingresa el siguiente link para restablecer la contraseña:
    
          <table
            border="0"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            style="border-collapse: collapse"
          >
            <tbody>
              <tr>
                <td height="20" style="line-height: 20px">&nbsp;</td>
              </tr>
              <tr>
                <td align="middle">
                  <a
                    href="${linkReset}"
                    style="color: #1b74e4; text-decoration: none"
                    target="_blank"
                    ><table
                      border="0"
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                      style="border-collapse: collapse"
                    >
                      <tbody>
                        <tr>
                          <td
                            style="
                              border-collapse: collapse;
                              border-radius: 6px;
                              text-align: center;
                              display: block;
                              background: #1877f2;
                              padding: 8px 20px 8px 20px;
                            "
                          >
                            <a
                              href="${linkReset}"
                              style="
                                color: #1b74e4;
                                text-decoration: none;
                                display: block;
                              "
                              target="_blank"
                              ><center>
                                <font size="3"
                                  ><span
                                    style="
                                      font-family: Helvetica Neue, Helvetica,
                                        Lucida Grande, tahoma, verdana, arial,
                                        sans-serif;
                                      white-space: nowrap;
                                      font-weight: bold;
                                      vertical-align: middle;
                                      color: #ffffff;
                                      font-weight: 500;
                                      font-family: Roboto-Medium, Roboto,
                                        -apple-system, BlinkMacSystemFont,
                                        Helvetica Neue, Helvetica, Lucida Grande,
                                        tahoma, verdana, arial, sans-serif;
                                      font-size: 17px;
                                    "
                                    >Cambiar&nbsp;contraseña</span
                                  ></font
                                >
                              </center></a
                            >
                          </td>
                        </tr>
                      </tbody>
                    </table></a
                  >
                </td>
              </tr>
              <tr>
                <td height="8" style="line-height: 8px">&nbsp;</td>
              </tr>
              <tr>
                <td height="20" style="line-height: 20px">&nbsp;</td>
              </tr>
            </tbody>
          </table>
          <p></p>

          Recuerde que solo tiene 3mn para completar el proceso.
          <br />
        </span>
        <div>
          <div></div>
          <div></div></div
      >
    </span>
  </div> 
`;
};
