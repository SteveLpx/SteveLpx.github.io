function resolveCourseConflicts (result) {
    let splitTag = '&'
    //将课拆成单节，并去重
    let allResultSet = new Set()
    result.forEach((singleCourse) => {
      singleCourse.weeks.forEach((week) => {
        singleCourse.sections.forEach((value) => {
          let course = { sections: [], weeks: [] }
          course.name = singleCourse.name
          course.teacher =
            singleCourse.teacher == undefined ? '' : singleCourse.teacher
          course.position =
            singleCourse.position == undefined ? '' : singleCourse.position
          course.day = singleCourse.day
          course.weeks.push(week)
          course.sections.push(value)
          allResultSet.add(JSON.stringify(course))
        })
      })
    })
    let allResult = JSON.parse(
      '[' + Array.from(allResultSet).toString() + ']'
    ).sort(function (a, b) {
      //return b.day - e.day;
      return a.day - b.day || a.sections[0] - b.sections[0]
    })
  
    //将冲突的课程进行合并
    let contractResult = []
    while (allResult.length !== 0) {
      let firstCourse = allResult.shift()
      if (firstCourse == undefined) continue
      let weekTag = firstCourse.day
      //   console.log(firstCourse)
      for (
        let i = 0;
        allResult[i] !== undefined && weekTag === allResult[i].day;
        i++
      ) {
        if (firstCourse.weeks[0] === allResult[i].weeks[0]) {
          if (firstCourse.sections[0] === allResult[i].sections[0]) {
            let index = firstCourse.name
              .split(splitTag)
              .indexOf(allResult[i].name)
            if (index === -1) {
              firstCourse.name += splitTag + allResult[i].name
              firstCourse.teacher += splitTag + allResult[i].teacher
              firstCourse.position += splitTag + allResult[i].position
              // firstCourse.position = firstCourse.position.replace(/undefined/g, '')
              allResult.splice(i, 1)
              i--
            } else {
              let teacher = firstCourse.teacher.split(splitTag)
              let position = firstCourse.position.split(splitTag)
              teacher[index] =
                teacher[index] === allResult[i].teacher
                  ? teacher[index]
                  : teacher[index] + ',' + allResult[i].teacher
              position[index] =
                position[index] === allResult[i].position
                  ? position[index]
                  : position[index] + ',' + allResult[i].position
              firstCourse.teacher = teacher.join(splitTag)
              firstCourse.position = position.join(splitTag)
              // firstCourse.position = firstCourse.position.replace(/undefined/g, '');
              allResult.splice(i, 1)
              i--
            }
          }
        }
      }
      contractResult.push(firstCourse)
    }
    //将每一天内的课程进行合并
    let finallyResult = []
    while (contractResult.length != 0) {
      let firstCourse = contractResult.shift()
      if (firstCourse == undefined) continue
      let weekTag = firstCourse.day
      for (
        let i = 0;
        contractResult[i] !== undefined && weekTag === contractResult[i].day;
        i++
      ) {
        if (
          firstCourse.weeks[0] === contractResult[i].weeks[0] &&
          firstCourse.name === contractResult[i].name &&
          firstCourse.position === contractResult[i].position &&
          firstCourse.teacher === contractResult[i].teacher
        ) {
          if (
            firstCourse.sections[firstCourse.sections.length - 1] + 1 ===
            contractResult[i].sections[0]
          ) {
            firstCourse.sections.push(contractResult[i].sections[0])
            contractResult.splice(i, 1)
            i--
          } else break
          // delete (contractResult[i])
        }
      }
      finallyResult.push(firstCourse)
    }
    //将课程的周次进行合并
    contractResult = JSON.parse(JSON.stringify(finallyResult))
    finallyResult.length = 0
    while (contractResult.length != 0) {
      let firstCourse = contractResult.shift()
      if (firstCourse == undefined) continue
      let weekTag = firstCourse.day
      for (
        let i = 0;
        contractResult[i] !== undefined && weekTag === contractResult[i].day;
        i++
      ) {
        if (
          firstCourse.sections.sort((a, b) => a - b).toString() ===
          contractResult[i].sections.sort((a, b) => a - b).toString() &&
          firstCourse.name === contractResult[i].name &&
          firstCourse.position === contractResult[i].position &&
          firstCourse.teacher === contractResult[i].teacher
        ) {
          firstCourse.weeks.push(contractResult[i].weeks[0])
          contractResult.splice(i, 1)
          i--
        }
      }
      finallyResult.push(firstCourse)
    }
    console.log(finallyResult)
    return finallyResult
  }
  
  function getWeeks (Str) {
    function range (con, tag) {
      let retWeek = []
      con
        .slice(0, -1)
        .split(',')
        .forEach((w) => {
          let tt = w.split('-')
          let start = parseInt(tt[0])
          let end = parseInt(tt[tt.length - 1])
          if (tag == 1 || tag == 2)
            retWeek.push(
              ...Array(end + 1 - start)
                .fill(start)
                .map((x, y) => x + y)
                .filter((f) => {
                  return f % tag == 0
                })
            )
          else
            retWeek.push(
              ...Array(end + 1 - start)
                .fill(start)
                .map((x, y) => x + y)
                .filter((v) => {
                  return v % 2 != 0
                })
            )
        })
      return retWeek
    }
    Str = Str.replace(/\(|\)|\{|\}|\||第|\[|\]/g, '').replace(/到/g, '-')
    let reWeek = []
    let week1 = []
    while (Str.search(/周|\s/) != -1) {
      let index = Str.search(/周|\s/)
      if (Str[index + 1] == '单' || Str[index + 1] == '双') {
        week1.push(Str.slice(0, index + 2).replace('周', ''))
        index += 2
      } else {
        week1.push(Str.slice(0, index + 1).replace('周', ''))
        index += 1
      }
  
      Str = Str.slice(index)
      index = Str.search(/\d/)
      if (index != -1) Str = Str.slice(index)
      else Str = ''
    }
    if (Str.length != 0) week1.push(Str)
  
    week1.forEach((v) => {
      console.log(v)
      if (v.slice(-1) == '双') reWeek.push(...range(v, 2))
      else if (v.slice(-1) == '单') reWeek.push(...range(v, 3))
      else reWeek.push(...range(v + '全', 1))
    })
    return reWeek
  }
  
  function cton (str) {
    let arr = ['', '一', '二', '三', '四', '五', '六', '七', '日']
    return arr.indexOf(str) == 8 ? arr.indexOf(str) - 1 : arr.indexOf(str)
  }
  
  function getjc (Str) {
    console.log(Str)
    let jc = []
    let jcar = Str.replace(/节|\[|\]/g, '').split('-')
    for (i = Number(jcar[0]); i <= jcar[jcar.length - 1]; i++) {
      jc.push(i)
    }
    return jc
  }
  function getre (v, day) {
    let re = { position: "", weeks: [], sections: [] }
    re.day = day
    console.log("---------------------", v)
    let ddkcar = v.split(/\s/).filter(vv => {
      return vv && vv.trim()
    }).filter(v => {
      return v.search(/校区/) == -1
    })
    re.name = ddkcar[0]
    re.teacher = ddkcar[2]
    ddkcar = ddkcar.slice(3)
    console.log(ddkcar)
    if (ddkcar[ddkcar.length - 2].search(/节|周/) == -1 && ddkcar[ddkcar.length - 1].search(/\D/) == -1) ddkcar.pop()
    console.log(1)
    if (ddkcar[ddkcar.length - 1].search("节") != -1 || ddkcar[ddkcar.length - 2].search(/周|单|双/) != -1 && ddkcar[ddkcar.length - 1].search("-") != -1) {
        console.log(2)
      re.sections = getjc(ddkcar[ddkcar.length - 1])
      ddkcar.pop()
      re.weeks = getWeeks(ddkcar.join(""))
    } else if (ddkcar[ddkcar.length - 1].search(/周/) != -1) return
    else {
        console.log(3)
      while (ddkcar[ddkcar.length - 1].search("节") == -1) {
        console.log(ddkcar[ddkcar.length - 1])
        re.position = re.position + ddkcar[ddkcar.length - 1]
        ddkcar.pop()
      }
      re.sections = getjc(ddkcar[ddkcar.length - 1])
      ddkcar.pop()
      re.weeks = getWeeks(ddkcar.join(""))
    }
    console.log(re)
    re.position = re.position
    return re
  }
  
  function scheduleHtmlParser (html) {
    //除函数名外都可编辑
    //传入的参数为上一步函数获取到的html
    //可使用正则匹配
    //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
    //以下为示例，您可以完全重写或在此基础上更改
    html = JSON.parse(html)
    let bz = html.bz
    let $ = cheerio.load(html.htm, { decodeEntities: false })
    let result = []
    if (bz == 'index') {
      let courses = $('div .weeklesson')
      courses.each(function (index, _) {
        let dayjie = $(this).attr('id').replace('weekly', '').split('_')
        let course = $(this).children('ul').html().split('<br>')
        course.forEach((lesson) => {
          $ = cheerio.load(lesson, { decodeEntities: false })
          let re = { weeks: [], sections: [] }
  
          $('li').each(function (index, __) {
            let con = $(this).text()
            switch (con.split('：')[0]) {
              case '课程名称':
                re.name = $(this).children('b').text()
                break
              case '任课教师':
                re.teacher = $(this).children('b').text()
                break
              case '上课地点':
                re.position = $(this).children('b').text()
                break
              case '上课时间':
                re.day = parseInt(dayjie[0])
                let temp = $(this).children('b').text()
                re.sections = getjc(temp.match(/\[.*?\]/g)[1])
                re.weeks = getWeeks(
                  temp.match(/\[.*?\]/g)[0] + temp.match(/\(.*?\)/g)
                )
                break
            }
          })
          result.push(JSON.parse(JSON.stringify(re)))
        })
      })
    } else if (bz == '列表') {
      $('tr').each(function (index, em) {
        let tds = $(this).find('td[style!="display: none"]')
        //    console.log(tds.length )
        if (
          tds.eq(0).text().slice(0, 1).search(/\d/) == -1 ||
          tds.length != 10 ||
          tds
            .eq(8)
            .text()
            .search(/未排课/) != -1
        )
          return
        let re = { weeks: [], sections: [] }
        let names = tds.eq(1).text().split(']')
        let teacher = tds.eq(5).text().split(']')
        let dd = tds
          .eq(8)
          .text()
          .split(/\(\d+\),?|\s{1},/)
          .filter(function (v) {
            return v && v.trim()
          })
        console.log(dd)
        re.name = names[names.length - 1]
        if (re.name.search(/网络课/) != -1) return
        re.teacher = teacher[teacher.length - 1]
        dd.forEach((con) => {
          arr = con.split(' ').filter(function (v) {
            return v && v.trim()
          })
          console.log(arr)
          let jcstr = arr[1].match(/(?<=\[).*?(?=\])/)[0]
          if(!jcstr) return
          re.weeks = getWeeks(arr[0])
          re.day = cton(arr[1].slice(0, 1))
          re.sections = getjc(jcstr)
          re.position = arr[2]
          result.push(JSON.parse(JSON.stringify(re)))
        })
      })
    } else if (bz == '二维表') {
      let trs = $('tr[class!="H"]')
      trs.each(function (index, em) {
        let td = $(this).find('.td')
        let i = 1
        td.each(function (ind, emm) {
          let div = $(this).find('div')
          div.each(function (indd, emmm) {
            let re = { weeks: [], sections: [] }
            if ($(this).text().trim() != 0) {
              let content = $(this).html().split('<br>')
              let jc = content[2].match(/(?<=\[).*?(?=\])/)[0]
              let week = content[2].split('[')[0]
              re.name = $(this).find('font').eq(0).text()
              if (re.name.search(/网络课/) != -1) return
        
              re.teacher = content[1]
              re.position = content[3]
              re.sections = getjc(jc)
              re.weeks = getWeeks(week)
              re.day = i
              result.push(re)
            }
          })
          i++
        })
      })
    } else if (bz == 1) {
      $('tr').each(function (index, em) {
        let tds = $(this).find('td[class="td"]')
        tds.each(function (index1, emm) {
          let div = $(this).find('div')
          div.each(function (ind, e) {
            if ($(this).text().trim().length == 0) return
            let font = $(this).find('font')
            if (font.length != 0 && font.eq(font.length - 1).attr('title') != undefined) {
              let text = font.eq(font.length - 1).attr('title')
              text = text.split(/\n/).filter(vv => {
                return vv && vv.trim()
              })
              text.forEach(v => {
                console.log(v)
                let re = getre(v, index1 + 1)
                if (re.sections.length == 0) return
                result.push(re)
              })
  
  
            } else {
              let font = $(this).find('font')
              if (font.length != 1) font = $(this)
  
              let coursearr = font.html().split("<br>").filter(vv => {
                return vv && vv.trim()
              })
              coursearr.forEach(v => {
                console.log(v)
                let re = getre(v, index1 + 1)
                if (re.sections.length == 0) return
                result.push(re)
              })
            }
          })
        })
      })
    } else if (bz == 2) {
      //  console.log(html.htm)
      let trs = $('tr')
      trs.each(function (index, em) {
        let td = $(this).find("td")
        let re = { weeks: [], sections: [] }
        if (td.length > 4 && td.eq(0).text() != '校区') {
          re.name = td.eq(4).text().split("]")[1]
          re.teacher = td.eq(13).text().replace(/\[.*?\]/g,"")
          re.weeks = getWeeks(td.eq(16).text() + "周" + td.eq(17).text())
          console.log(td.eq(18).text())
          let jcstr = td.eq(18).text().match(/(?<=\[).*?(?=\])/)
          if(!jcstr) return;
          re.sections = getjc(jcstr[0])
          re.day = cton(td.eq(18).text().split("[")[0])
          re.position = td.eq(19).text()
        }
        if (re.weeks.length == 0 || re.sections.length == 0) return
        result.push(re)
      })
    }
  
    else {
      result.length == 0
      result.push({
        name: '遇到错误,请加群:628325112,找开发者进行反馈',
        teacher: '开发者-1nfiite',
        position: bz,
        day: 1,
        weeks: [1],
        sections: [{ section: 1 }, { section: 2 }],
      })
    }
    if (result.length == 0)
      result.push({
        name: '遇到错误,请加群:628325112,找开发者进行反馈',
        teacher: '开发者-1nfiite',
        position: '未获取到课表',
        day: 1,
        weeks: [1],
        sections: [{ section: 1 }, { section: 2 }],
      })
    result.forEach(v=>v.position=!v.position?"":v.position.replace(/^\[.*?\]/g,""))
    result = resolveCourseConflicts(result)
    return result
  }
  