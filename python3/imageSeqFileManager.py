import msgProc
import glob
import packetDefs
import time
import stat
import os

def file_age_in_seconds(pathname):
        return time.time() - os.stat(pathname)[stat.ST_MTIME]

def listOfGWFiles(path):
        fileList = glob.glob(path + "/*")
        return fileList

def constructJPGPath(pathInfo):
        temp = pathInfo.split("GW")
        temp2 = temp[0].replace("imageSeq","images",1)
        fullJPGFilePath = temp2 + ".jpg"
        return fullJPGFilePath

def constructSeqPath(pathInfo):
        temp = pathInfo.split("imageSeq")
        seqPath = temp[0] + "imageSeq"
        return seqPath

def parseFileId(path):
        FileId = None
        temp = path.split("imageSeq/image")
        try:
                temp2 = temp[1].split('GW')
                FileId = int(temp2[0])
        except:
                FileId = None
                
        return FileId

def deletePrevSeqFiles(seqFilePath,saveFileID):

        fileList = glob.glob(seqFilePath + "/*")
        for filePath in fileList:
                tempFileId = parseFileId(filePath)
                age = file_age_in_seconds(filePath)
                if( (tempFileId != saveFileID) or (age > 300.0) ):
                        try:
                                os.remove(filePath)
                                print("Removed " + filePath)
                        except OSError as e:
                                print("Error: %s : %s" % (file_path, e.strerror))
        time.sleep(.5)

def processSeqFile(msgFromPipe):
        HABPacketImageSeqStartMsg        = packetDefs.HABPacketImageSeqStart()
        HABPacketImageSeqDataMsg         = packetDefs.HABPacketImageSeqData()

        a = []
        prevFileSize = 0
        
        jpgFileFullPath = constructJPGPath(msgFromPipe)
        seqFilePath     = constructSeqPath(msgFromPipe)
        saveFileID      = parseFileId(msgFromPipe)
        if(saveFileID != None):
                deletePrevSeqFiles(seqFilePath,saveFileID)
                
                seqFileList = listOfGWFiles(seqFilePath)
        
                for seqFilePath in seqFileList:
                        curFileID = parseFileId(seqFilePath)
                        if(curFileID == saveFileID):
                                seqFile = open(seqFilePath, "rb")
                
                                status = seqFile.readinto(HABPacketImageSeqStartMsg)

                                #print(HABPacketImageSeqStartMsg.packetType)
                                #print(HABPacketImageSeqStartMsg.imageFileID)
                                #print(HABPacketImageSeqStartMsg.gwID)
                                #print(HABPacketImageSeqStartMsg.fileSize)
                
                                numPackets =  int(HABPacketImageSeqStartMsg.fileSize/packetDefs.MAX_BYTES)
                                endByes = HABPacketImageSeqStartMsg.fileSize % packetDefs.MAX_BYTES
                                try:
                                        if (not a) or (HABPacketImageSeqStartMsg.fileSize != prevFileSize):
                                                a = []
                                                prevFileSize = HABPacketImageSeqStartMsg.fileSize
                                                for i in range(numPackets):
                                                        byte_array = bytearray(packetDefs.MAX_BYTES)
                                                        a.insert(i,byte_array)
                        
                                                if(endByes > 0):
                                                        numPackets = numPackets + 1
                                                        byte_array = bytearray(endByes)
                                                        a.insert(numPackets,byte_array)
                        
                                        bytesRead = seqFile.readinto(HABPacketImageSeqDataMsg)
                                        while(HABPacketImageSeqDataMsg.packetType != 0x12 and bytesRead !=0):
                                                for j in range(HABPacketImageSeqDataMsg.imageDataLen): 
                                                        a[HABPacketImageSeqDataMsg.imageSeqNum][j] = HABPacketImageSeqDataMsg.imageData[j]
                        
                                                bytesRead = seqFile.readinto(HABPacketImageSeqDataMsg)
                                        seqFile.close()
                        
                                        jpgFile = open(jpgFileFullPath, "wb")
                                        for element in a:
                                                jpgFile.write(element)   
                                
                                        jpgFile.close()
                                        print("Done")
                                except:
                                        seqFile.close()

if __name__ == "__main__":

        result = True

        pipeMsgProcessor = msgProc.pipeMsgProc("./pipe_req",False)

        result = pipeMsgProcessor.CONNECT()
        if(result == False):
                print("Fatal ERROR could not connect to FIFOs")
                exit(1)

        result = pipeMsgProcessor.START()
        if(result == False):
                print("Fatal ERROR could not START pipeMsgProcessor Thread")
                exit(1)

        while(1):
                msgList = pipeMsgProcessor.REQ()
                msgList = msgList.splitlines()
                for msg in msgList:
                        if(msg != ""):
                                print("msgFromPipe " + msg)
                                processSeqFile(msg)

